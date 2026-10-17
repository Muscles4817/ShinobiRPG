import type { PersonDef, Tone } from '@/content';
import { reactionTo, recordMeeting, stageName, stageOf } from '@/systems/bonds';
import type { JournalChip } from '@/systems/journal';

import type { GameContext } from '../context';
import { chip } from '../ops';
import type { GameState } from '../state';
import { festivalBondBonus } from '../village';
import { bondOf, tastesOf } from './cast';
import { warmed } from './warmth';

/**
 * An hour spent with someone off duty (a drink, a soak): it counts as the day's time with
 * them, and is worth what their traits make of its tone, plus whatever the outing adds.
 */

export interface Outing {
  readonly tone: Tone;
  /** What the outing is worth beyond a plain talk in that tone. */
  readonly bonus: number;
}

/** How the tone lands with them, before the outing, festivals or meals add anything. */
export function toneReaction(ctx: GameContext, person: PersonDef, tone: Tone): number {
  return reactionTo(tastesOf(person, ctx), tone);
}

/** What the outing with this person is worth to the bond today. */
export function outingWarmth(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
  outing: Outing,
): number {
  const reaction = toneReaction(ctx, person, outing.tone);
  return warmed(state, ctx, reaction + outing.bonus + festivalBondBonus(state, ctx), person);
}

/** Records the time together: the bond moves and today's time with them is spent. */
export function timeTogether(
  state: GameState,
  person: PersonDef,
  delta: number,
): { readonly state: GameState; readonly chips: readonly JournalChip[] } {
  const before = bondOf(state, person.id);
  const after = recordMeeting(before, { day: state.time.day, delta });
  const newStage = stageOf(after.points) > stageOf(before.points);
  return {
    state: {
      ...state,
      people: { ...state.people, bonds: { ...state.people.bonds, [person.id]: after } },
    },
    chips: [
      chip(`${person.name} ${delta >= 0 ? '+' : ''}${delta}`, delta > 0 ? 'gain' : 'harm'),
      ...(newStage ? [chip(stageName(stageOf(after.points)), 'gain')] : []),
    ],
  };
}
