import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import type { GameState } from '../state';
import { AFTER_ACTION, BEFORE_ACTION } from './aroundActions';
import { sequence } from './run';
import type { HappeningTrace } from './types';

/**
 * What the world does to you, declared and run in order (`docs/design/happenings-plan.md`):
 * the happenings around each action and as time passes, each with what it needs.
 */

export { AFTER_ACTION, BEFORE_ACTION } from './aroundActions';
export { TIME_PASSING } from './timePassing';
export { needHolds } from './needs';
export type { HappeningTrace, Need } from './types';

export interface AroundAction {
  readonly state: GameState;
  readonly action: GameAction;
  readonly ctx: GameContext;
  /** Filled with every happening's turn, when a test asks. */
  readonly trace?: HappeningTrace[];
}

/** An action with what happens around it: before it, it performed, then after it. */
export function aroundAction(
  { state, action, ctx, trace }: AroundAction,
  perform: (shown: GameState) => GameState,
): GameState {
  const shown = sequence(BEFORE_ACTION, { ctx, before: state, now: state, action }, trace);
  return sequence(AFTER_ACTION, { ctx, before: state, now: perform(shown), action }, trace);
}

/** Only what happens after an action, on states given: for tests of a happening's needs. */
export function afterAction(
  { state, action, ctx, trace }: AroundAction,
  after: GameState,
): GameState {
  return sequence(AFTER_ACTION, { ctx, before: state, now: after, action }, trace);
}
