import { createRng, err, ok, type Result } from '@/core';

import { HANDLERS } from './actions/registry';
import type { ActionHandler, GameAction } from './actions/types';
import type { GameContext } from './context';
import type { GameState } from './state';

function handlerFor<A extends GameAction>(action: A): ActionHandler<A> {
  // The registry's mapped type guarantees HANDLERS[action.type] handles exactly `A`.
  return HANDLERS[action.type] as unknown as ActionHandler<A>;
}

/** Why `action` is not allowed right now, or null if it is. Used by the UI to disable buttons. */
export function blockerFor(state: GameState, action: GameAction, ctx: GameContext): string | null {
  return handlerFor(action).check(state, action, ctx);
}

/**
 * The single entry point for changing game state. Pure and deterministic: the same state,
 * action and context always produce the same result (randomness comes from `state.rngState`).
 */
export function dispatch(
  state: GameState,
  action: GameAction,
  ctx: GameContext,
): Result<GameState> {
  const handler = handlerFor(action);
  const blocker = handler.check(state, action, ctx);
  if (blocker) return err(blocker);

  const rng = createRng(state.rngState);
  const next = handler.perform(state, action, ctx, rng);
  return ok({ ...next, rngState: rng.state() });
}
