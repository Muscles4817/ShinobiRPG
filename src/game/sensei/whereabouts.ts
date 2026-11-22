import { SLOTS_PER_DAY } from '@/systems/time';

import type { GameContext } from '../context';
import { factsOf, recordFact } from '../facts/record';
import { atHomeVillage } from '../homeVillage';
import { laidUp } from '../injuries';
import type { GameState } from '../state';

/**
 * Where you were as each slot of the day passed, as far as your sensei cares: at hand (home, not
 * out on a job and not laid up) or not. It is written as the time passes (a happening, first in
 * `TIME_PASSING`), so a day is settled by what was true on it: a lesson skipped at home is
 * missed even if a job then carries you past midnight, and a lesson spent on a job is excused
 * even if you are home by then.
 */

/**
 * At hand for your sensei: home, and not away on a job, a trip or a venture past the edge, or
 * laid up. A day at the edge of the woods needs no pass, so it is no excuse for missing them.
 */
export function atHand(state: GameState, ctx: GameContext): boolean {
  const out = state.mission !== null && state.mission.venture?.depth !== 'edge';
  return !out && atHomeVillage(state, ctx) && laidUp(state, ctx) === null;
}

/**
 * The slots that passed between `before` and `now`, each as its day and slot, with you as you
 * were when the time began to pass (spending time moves only the clock and your body).
 */
export function noteWhereabouts(before: GameState, now: GameState, ctx: GameContext): GameState {
  if (!atHand(before, ctx)) return now;
  const from = before.time.day * SLOTS_PER_DAY + before.time.slot;
  const to = now.time.day * SLOTS_PER_DAY + now.time.slot;
  let noted = now;
  for (let at = from; at < to; at++) {
    const day = Math.floor(at / SLOTS_PER_DAY);
    noted = recordFact(noted, { kind: 'atHand', day, slot: at % SLOTS_PER_DAY });
  }
  return noted;
}

/**
 * Excused from a meeting on `day` in these slots: you were never at hand while it was on. A slot
 * with no record (before saves kept them) counts as not at hand.
 */
export function excusedOn(state: GameState, day: number, slots: readonly number[]): boolean {
  return !factsOf(state.facts, 'atHand').some((f) => f.day === day && slots.includes(f.slot));
}
