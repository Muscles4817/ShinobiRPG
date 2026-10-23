import type { GameAction, GameActionType } from '../actions/types';
import type { GameState } from '../state';
import { closeDay } from './close';
import { openDay } from './open';

/**
 * Keeps the day's record as actions happen (called from `dispatch`). When an action carries
 * time into a new morning, the day that ended is closed and kept for the end-of-day sheet, and
 * a new one opens. A day that ends on the road, mid-job or mid-exam is not kept: the job's
 * debrief and the trip home tell those days, and the record starts again from there.
 */

/** Going to bed: anything else that carries you into the morning was a night without sleep. */
const SLEEPING: readonly GameActionType[] = ['sleep', 'takeRoom', 'makeCamp'];

function away(state: GameState): boolean {
  return state.mission !== null || state.exams.run !== null;
}

export function noteDayEnd(before: GameState, after: GameState, action: GameAction): GameState {
  const { start } = after.daybook;
  if (start === null) return { ...after, daybook: { ...after.daybook, start: openDay(after) } };
  if (after.time.day === before.time.day) return after;
  const keep = !away(before) && !away(after) && (after.settings.dayEnd ?? 'full') !== 'off';
  const ended = keep ? closeDay(start, after, SLEEPING.includes(action.type)) : after.daybook.ended;
  return { ...after, daybook: { start: openDay(after), ended } };
}
