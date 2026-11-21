import { createRng, err, ok, type Result } from '@/core';

import { HANDLERS } from './actions/registry';
import type { ActionHandler, GameAction } from './actions/types';
import type { GameContext } from './context';
import { aroundAction } from './happenings';
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
 * The verb is checked and performed; around it, what the world does follows from it in the
 * declared order (`happenings/aroundActions.ts`), each happening only where its needs hold.
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
  const next = aroundAction({ state, action, ctx }, (shown) =>
    handler.perform(shown, action, ctx, rng),
  );
  return ok({ ...next, rngState: rng.state() });
}
