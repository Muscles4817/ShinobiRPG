import type { Rng } from '@/core';
import {
  applyOutcome,
  holds,
  type CampActivity,
  type CampStage,
  type MissionDef,
  type MissionNote,
} from '@/systems/missions';
import { checkChance, diffStats, rollCheck } from '@/systems/stats';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';

import type { GameContext } from '../context';
import { growCharacter, logDiscoveries } from '../growth';
import { bestHandFor, yourCheckValue, yourHand } from '../missionRoles';
import { adjust, chip, log, statChips } from '../ops';
import type { GameState } from '../state';
import { cookForCamp, forageCamp } from './campKitchen';
import { SENSEI_FIRESIDE, senseiAlong, sitWithSensei } from './fireside';
import { bondWithOne, crewPeople, feel } from './personal';
import { storyOf } from './state';
import { voiceOf } from './voices';

/**
 * A night around the fire: a few things to do before it burns down. Sit with the charge (they
 * open up once they trust you), sit with someone in the crew, keep watch, drill, sleep, forage
 * or cook for everyone (`campKitchen.ts`).
 */

/** Bond for an evening by the fire with someone. */
export const CAMP_TALK_BOND = 4;
/** A drill by the fire, against a full session's gains at home. */
export const CAMP_DRILL_GAIN = 0.8;
export const CAMP_DRILL_ENERGY = 15;
/** Energy back from turning in early and sleeping properly. */
export const CAMP_REST_ENERGY = 30;

/**
 * The camp activities on offer now: their indexes, those not done and whose condition holds,
 * and an evening with your sensei (`SENSEI_FIRESIDE`) first when they are along.
 */
export function campChoices(state: GameState, ctx: GameContext, stage: CampStage): number[] {
  const run = state.mission;
  if (!run) return [];
  const done = run.camp?.done ?? [];
  const fireside =
    senseiAlong(state, ctx) && !done.includes(String(SENSEI_FIRESIDE)) ? [SENSEI_FIRESIDE] : [];
  return [
    ...fireside,
    ...stage.activities.flatMap((a, i) =>
      done.includes(String(i)) || !holds(storyOf(run), a.when) ? [] : [i],
    ),
  ];
}

/** Whether the fire has burned down: every pick used. */
export function campOver(state: GameState, stage: CampStage): boolean {
  return (state.mission?.camp?.done.length ?? 0) >= stage.picks;
}

function told(state: GameState, ...notes: MissionNote[]): GameState {
  const run = state.mission;
  return run ? { ...state, mission: { ...run, notes: [...run.notes, ...notes] } } : state;
}

function sitWithCharge(
  state: GameState,
  def: MissionDef,
  activity: Extract<CampActivity, { kind: 'charge' }>,
): GameState {
  const run = state.mission;
  if (!run) return state;
  if (!holds(storyOf(run), activity.opensWhen))
    return told(state, { kind: 'story', text: activity.guarded });
  const applied = applyOutcome(run, def, activity.outcome, 'gain');
  const felt = feel({ ...state, mission: applied.run }, applied.personal);
  return told(felt.state, { kind: 'story', text: activity.text });
}

/** An evening with the crew member you're least close to: bond, and what they talk about. */
function sitWithCrew(state: GameState, ctx: GameContext): GameState {
  // Your sensei has an evening of their own; the crew is everyone else, when there is anyone.
  const sensei = senseiAlong(state, ctx);
  const crew = crewPeople(state, ctx);
  const others = crew.filter((p) => p.id !== sensei?.id);
  const [person] = (others.length > 0 ? others : crew).sort(
    (a, b) => (state.people.bonds[a.id]?.points ?? 0) - (state.people.bonds[b.id]?.points ?? 0),
  );
  if (!person) return told(state, { kind: 'story', text: 'You sit alone with the fire.' });
  const memory = state.village.memories.findLast((m) => m.personId === person.id);
  const voice: MissionNote | null = memory
    ? { kind: 'voice', speaker: person.name, text: `Remember ${memory.text}?` }
    : voiceOf(state, ctx, { person, moment: 'camp' });
  const closer = bondWithOne(state, person.id, CAMP_TALK_BOND);
  const line: MissionNote = { kind: 'story', text: `You sit with ${person.name} by the fire.` };
  const logged = log(closer, {
    text: line.text,
    tone: 'success',
    chips: [chip(`+${CAMP_TALK_BOND} bond with ${person.name}`, 'gain')],
  });
  return told(logged, line, ...(voice ? [voice] : []));
}

function keepWatch(
  state: GameState,
  ctx: GameContext,
  rng: Rng,
  input: { readonly def: MissionDef; readonly activity: Extract<CampActivity, { kind: 'watch' }> },
): GameState {
  const { def, activity } = input;
  const hand = activity.role
    ? bestHandFor(state, ctx, activity.stat)
    : yourHand(state, ctx, activity.stat);
  const { success, chance } = rollCheck(hand.value, activity.difficulty, rng);
  const roll: MissionNote = { kind: 'roll', stat: activity.stat, chance, success };
  if (!success || !state.mission)
    return told(state, roll, { kind: 'story', text: activity.failure });
  const applied = applyOutcome(state.mission, def, activity.onSuccess, 'gain');
  const felt = feel({ ...state, mission: applied.run }, applied.personal);
  return told(felt.state, roll, { kind: 'story', text: activity.success });
}

/** Your best art: what you drill when there's only a fire and an hour. */
function bestArt(state: GameState): Discipline {
  const { stats } = state.character;
  return [...DISCIPLINES].sort((a, b) => stats[b] - stats[a])[0] ?? 'taijutsu';
}

function drill(state: GameState, ctx: GameContext): GameState {
  const art = bestArt(state);
  const grown = growCharacter(state.character, { [art]: CAMP_DRILL_GAIN }, ctx);
  const drilled = adjust({ ...state, character: grown.character }, { energy: -CAMP_DRILL_ENERGY });
  const text = 'You drill by the firelight until your arms ache.';
  const logged = log(drilled, {
    text,
    tone: 'success',
    chips: [
      ...statChips(diffStats(state.character.stats, grown.character.stats)),
      chip(`−${CAMP_DRILL_ENERGY} energy`, 'cost'),
    ],
  });
  return told(logDiscoveries(logged, grown.discovered, ctx), { kind: 'story', text });
}

function rest(state: GameState): GameState {
  const text = 'You turn in early and sleep like the dead.';
  const rested = log(adjust(state, { energy: CAMP_REST_ENERGY }), {
    text,
    tone: 'success',
    chips: [chip(`+${CAMP_REST_ENERGY} energy`, 'gain')],
  });
  return told(rested, { kind: 'story', text });
}

interface CampTurn {
  readonly def: MissionDef;
  readonly activity: CampActivity;
  readonly index: number;
}

/** An evening with your sensei, marked done like any other thing by the fire. */
export function campWithSensei(state: GameState, ctx: GameContext): GameState {
  const sensei = senseiAlong(state, ctx);
  if (!sensei) return state;
  const choice = told(state, { kind: 'choice', text: `Sit with ${sensei.name}` });
  const after = sitWithSensei(choice, ctx, sensei);
  const run = after.mission;
  if (!run) return after;
  const done = [...(run.camp?.done ?? []), String(SENSEI_FIRESIDE)];
  return { ...after, mission: { ...run, camp: { done } } };
}

/** One thing done by the fire, and marked done. */
export function campActivity(
  state: GameState,
  ctx: GameContext,
  rng: Rng,
  turn: CampTurn,
): GameState {
  const { def, activity } = turn;
  const choice = told(state, { kind: 'choice', text: activity.label });
  const after = ((): GameState => {
    switch (activity.kind) {
      case 'charge':
        return sitWithCharge(choice, def, activity);
      case 'crew':
        return sitWithCrew(choice, ctx);
      case 'watch':
        return keepWatch(choice, ctx, rng, { def, activity });
      case 'drill':
        return drill(choice, ctx);
      case 'rest':
        return rest(choice);
      case 'forage': {
        const foraged = forageCamp(choice, ctx, rng);
        return told(foraged.state, ...foraged.notes);
      }
      case 'cook': {
        const cooked = cookForCamp(choice, ctx);
        return told(cooked.state, ...cooked.notes);
      }
    }
  })();
  const run = after.mission;
  if (!run) return after;
  const done = [...(run.camp?.done ?? []), String(turn.index)];
  return { ...after, mission: { ...run, camp: { done } } };
}

/** The odds of a watch, for its choice ("Perception 70%"). */
export function watchOdds(
  state: GameState,
  ctx: GameContext,
  activity: CampActivity,
): number | null {
  if (activity.kind !== 'watch') return null;
  const value = activity.role
    ? bestHandFor(state, ctx, activity.stat).value
    : yourCheckValue(state, ctx, activity.stat);
  return checkChance(value, activity.difficulty);
}
