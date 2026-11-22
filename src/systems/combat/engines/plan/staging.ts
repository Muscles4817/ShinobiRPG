import { STAT_GRADES, statTier } from '@/systems/stats';

import type { CombatTechnique, RangeBand } from '../../contract';
import type { CombatEvent, NarrationForce, ToldEvent } from '../../storyContract';
import { findCard, type Card } from './cards';
import type { CardId, PlanFighter, PlanState, Round } from './state';
import { standingNow, statusesOf } from './storyLevel';
import { bandOf, distanceBetween } from './distance';

/**
 * Staging a turn for the screen. Each line a turn told is its maker's (`actor`), with the distance
 * the turn began at and, if it moved the fight, the new one, and how big the turn was (`force`):
 * the grade of its maker in the art the card works by, the ground an area technique covered, and
 * its element. Two genin trading kunai and two jōnin trading fire are the same fight on paper
 * (damage is a gap, decision 16), so the size has to come from who fought and what they threw,
 * not from the damage. The statuses the turn changed follow its lines.
 */

type Art = 'taijutsu' | 'ninjutsu' | 'genjutsu' | 'kenjutsu' | 'fuuinjutsu';

function artOf(fighter: PlanFighter, card: Card | null): Art {
  if (card?.kind === 'jutsu') return card.technique.discipline;
  if (card?.kind === 'strike') return 'taijutsu';
  const { attributes } = fighter;
  // Anything else (a throw, a tool, a step) is done as well as their best art allows.
  const arts: readonly Art[] = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'];
  return arts.reduce((best, art) => (attributes[art] > attributes[best] ? art : best));
}

function areaOf(technique: CombatTechnique): NarrationForce['size'] {
  for (const effect of technique.effects) {
    if (effect.verb === 'area') return effect.size ?? 'small';
  }
  return null;
}

/** The force of `fighter`'s turn playing card `id` (or none, for a turn that played nothing). */
export function turnForce(fighter: PlanFighter, id: CardId | undefined): NarrationForce {
  const card = id ? findCard(fighter, id) : null;
  const grade = STAT_GRADES.indexOf(statTier(fighter.attributes[artOf(fighter, card)]).grade);
  const technique = card?.kind === 'jutsu' ? card.technique : null;
  return {
    grade: Math.max(0, grade),
    size: technique ? areaOf(technique) : null,
    element: technique?.element ?? null,
  };
}

type Standing = Pick<PlanState, 'fighters' | 'field' | 'mark' | 'foeMark'>;

/**
 * Where everyone stands as an exchange opens, then its divider ("— Second exchange —"); the first
 * of a round says it opens the round.
 */
export function exchangeDivider(name: string, round: Standing, first: boolean): CombatEvent[] {
  const divider: ToldEvent = {
    kind: 'told',
    text: `— ${name} exchange —`,
    divider: true,
    ...(first ? { opensRound: true as const } : {}),
  };
  return [...standingNow(round), divider];
}

/** A divider between rounds or acts of the fight ("— The fight begins —"). */
export function dividerTold(text: string): ToldEvent {
  return { kind: 'told', text, divider: true };
}

/** The statuses of those whose statuses the turn changed (an empty list where all ended). */
function statusesMoved(before: Standing, after: Standing): CombatEvent[] {
  const was = statusesOf(before);
  return Object.entries(statusesOf(after)).flatMap(([who, now]): CombatEvent[] =>
    now.join(';') === (was[who] ?? []).join(';') ? [] : [{ kind: 'status', who, statuses: now }],
  );
}

/** How far a fighter stands from whom they aim at, else from the foe they face. */
function standing(round: Round, id: string, aimedAt: string | undefined): RangeBand {
  const fighter = round.fighters.find((f) => f.id === id);
  if (!fighter) return round.range;
  // Only a foe stands at a distance of their own: a teammate helped is beside them.
  const foe = round.fighters.find((f) => f.id === aimedAt && f.side !== fighter.side);
  return foe ? distanceBetween(round, id, foe.id) : bandOf(round, fighter);
}

interface TurnTags {
  readonly id: string;
  readonly force: NarrationForce | null;
  readonly first: number;
  readonly last: number;
  readonly startedAt: RangeBand;
  readonly endedAt: RangeBand;
  readonly offPlan: Round['offPlan'];
}

/** One told line of a turn, tagged as its maker's, sized, and placed. */
function tagged(e: ToldEvent, i: number, tags: TurnTags): ToldEvent {
  const moved = i === tags.last && tags.endedAt !== tags.startedAt;
  const range = moved ? tags.endedAt : i === tags.first ? tags.startedAt : undefined;
  return {
    ...e,
    ...(e.actor === undefined ? { actor: tags.id } : {}),
    ...(range && e.range === undefined ? { range } : {}),
    ...(tags.force && e.force === undefined ? { force: tags.force } : {}),
    ...(i === tags.first && tags.offPlan ? { offPlan: tags.offPlan } : {}),
  };
}

/**
 * A turn as the screen stages it: every line it told tagged as its maker's, the first with the
 * distance the turn began at and the last with the new one if the turn moved the fight, each
 * with how big the turn was, then the statuses the turn changed. The tags are narration only:
 * the turn plays exactly as untagged.
 */
export function staged(before: Round, after: Round, id: string): Round {
  const { played, offPlan, aimedAt, ...turn } = after;
  const actor = turn.fighters.find((f) => f.id === id);
  const added = turn.story.slice(before.story.length);
  const told = added.flatMap((e, i) => (e.kind === 'told' ? [i] : []));
  const tags: TurnTags = {
    id,
    force: actor ? turnForce(actor, played) : null,
    first: told[0] ?? -1,
    last: told.at(-1) ?? -1,
    // Where the fight stands for the one whose turn it is: from whom they aim at, else the foe
    // they face (`distance.ts`).
    startedAt: standing(before, id, aimedAt),
    endedAt: standing(turn, id, aimedAt),
    offPlan,
  };
  const lines = added.map((e, i) => (e.kind === 'told' ? tagged(e, i, tags) : e));
  // The statuses it changed show with its last line, as everything it did has been done.
  const at = tags.last < 0 ? lines.length : tags.last;
  const moved = statusesMoved(before, turn);
  return {
    ...turn,
    story: [...before.story, ...lines.slice(0, at), ...moved, ...lines.slice(at)],
  };
}
