import type { CombatOutcome } from '@/systems/combat';
import { stageFoes } from '@/systems/missions';
import { diffStats, reservesFromChakraSpent, type StatDelta, type Stats } from '@/systems/stats';
import { MAX_HEALTH } from '@/systems/vitals';

import { enemyStatLine, PLAYER_COMBATANT_ID } from './combatants';
import type { GameContext } from './context';
import { growCharacter, logDiscoveries } from './growth';
import { activeStage } from './missionFlow';
import { log, statChips } from './ops';
import { personStats } from './people/progress';
import { findPerson } from './people/cast';
import type { Report } from './reports';
import type { GameState } from './state';

/**
 * What a finished fight teaches you, win or lose. A fight is a lesson from the foe, scaled
 * down (`FIGHT_SCALE`): in each art you used (a technique's discipline; plain strikes are
 * taijutsu, thrown kunai teach no art) you learn by the teacher rule against the foe's best
 * value in it, so a stronger foe teaches well and a weaker one almost nothing. The body learns
 * the same way from what you did: blows build strength, footwork speed, and taking hits
 * stamina. The chakra you paid out deepens your reserves, as practice of your own.
 */

/** A fight is worth this share of a session with the same person as a teacher. */
export const FIGHT_SCALE = 0.3;
/** Base gain in each art used, before the scale (a drill's main gain is about 1.5). */
export const FIGHT_ART_GAIN = 1.5;
/** Base gain in a body stat the fight worked. */
export const FIGHT_BODY_GAIN = 0.5;
/** Taking at least this share of your health in hits works your stamina. */
const HITS_FOR_STAMINA = 0.1;

const HEADING = 'What the fight taught you';
const STORY = 'Going up against someone for real shows you what drills cannot.';

/** Everything the growth needs about a fight, read before its result is applied. */
export interface FightLessons {
  readonly outcome: CombatOutcome;
  /** The stat lines of everyone you fought against. */
  readonly foes: readonly Stats[];
  /** Health you lost in the fight. */
  readonly hurt: number;
  /** Reports already waiting before the fight's own: its card comes after these. */
  readonly reportsBefore: number;
}

/** The people or enemies on the other side of the fight now in progress. */
function foesFaced(state: GameState, ctx: GameContext): Stats[] {
  const partnerId = state.people.sparringWith;
  if (partnerId) {
    const partner = findPerson(state, ctx, partnerId);
    return partner ? [personStats(partner, state)] : [];
  }
  const stage = activeStage(state, ctx);
  return (stage ? stageFoes(stage) : []).map((id) =>
    enemyStatLine(ctx.content.enemies.require(id)),
  );
}

/** Reads what the fight can teach, from the state as the fight ended (before it is resolved). */
export function fightLessons(
  state: GameState,
  outcome: CombatOutcome,
  ctx: GameContext,
): FightLessons {
  const hurt = Math.max(0, state.character.vitals.health - outcome.player.health);
  return { outcome, foes: foesFaced(state, ctx), hurt, reportsBefore: state.reports.length };
}

/** The work the fight gave you, as base gains before the fight's scale. */
function practisedIn(lessons: FightLessons, ctx: GameContext): StatDelta {
  const used = lessons.outcome.used?.[PLAYER_COMBATANT_ID];
  const gains: Partial<Record<keyof Stats, number>> = {};
  for (const id of used?.techniqueIds ?? []) {
    const def = ctx.content.techniques.get(id);
    if (def) gains[def.discipline] = FIGHT_ART_GAIN;
  }
  if ((used?.blows ?? 0) > 0) {
    gains.taijutsu = FIGHT_ART_GAIN;
    gains.strength = FIGHT_BODY_GAIN;
  }
  if ((used?.footwork ?? 0) > 0) gains.speed = FIGHT_BODY_GAIN;
  if (lessons.hurt >= MAX_HEALTH * HITS_FOR_STAMINA) gains.stamina = FIGHT_BODY_GAIN;
  return gains;
}

/** The foes' best value in each stat practised: who you learned it from. */
function bestOf(foes: readonly Stats[], practised: StatDelta): StatDelta {
  const ids = Object.keys(practised) as (keyof Stats)[];
  return Object.fromEntries(ids.map((id) => [id, Math.max(0, ...foes.map((f) => f[id]))]));
}

function scaled(gains: StatDelta): StatDelta {
  return Object.fromEntries(Object.entries(gains).map(([id, v]) => [id, v * FIGHT_SCALE]));
}

/** A fight's own card with what it taught written on; null for any other card. */
function withTaught(card: Report, taught: readonly string[]): Report | null {
  switch (card.kind) {
    case 'fight':
    case 'defeat':
      return { ...card, taught };
    case 'spar':
      return { ...card, gains: taught };
    case 'mission-complete':
    case 'mission-failed':
    case 'lesson':
    case 'team-formed':
    case 'grade':
      return null;
  }
}

/** Puts what the fight taught on the card it left (the fight, the defeat or the spar). */
function onFightCard(
  reports: readonly Report[],
  taught: readonly string[],
  since: number,
): readonly Report[] {
  const index = reports.findIndex((r, i) => i >= since && withTaught(r, taught) !== null);
  return reports.map((r, i) => (i === index ? (withTaught(r, taught) ?? r) : r));
}

/** Grows the character from a finished fight (see the header), with a journal line. */
export function growFromFight(
  state: GameState,
  lessons: FightLessons,
  ctx: GameContext,
): GameState {
  const practised = practisedIn(lessons, ctx);
  const gains = {
    ...scaled(practised),
    ...reservesFromChakraSpent(lessons.outcome.chakraSpent ?? 0),
  };
  if (Object.keys(gains).length === 0) return state;
  const before = state.character.stats;
  const teachers = bestOf(lessons.foes, practised);
  const growth = growCharacter(state.character, gains, ctx, { teachers });
  const chips = statChips(diffStats(before, growth.character.stats));
  const next = { ...state, character: growth.character };
  // Too little to show is still kept: it adds up over many fights.
  if (chips.length === 0) return logDiscoveries(next, growth.discovered, ctx);
  const logged = log(
    {
      ...next,
      reports: onFightCard(
        next.reports,
        chips.map((c) => c.label),
        lessons.reportsBefore,
      ),
    },
    { heading: HEADING, text: STORY, tone: 'info', chips },
  );
  return logDiscoveries(logged, growth.discovered, ctx);
}
