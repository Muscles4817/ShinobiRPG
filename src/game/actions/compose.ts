import type { Rng } from '@/core';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import type { ActionHandler, GameAction } from './types';

/**
 * One verb running another (taking up a challenge is a spar; hurrying is the road's Continue).
 * The other's check is part of this one's: the caller asks it in its own `check`, and here it is
 * asked again, so a perform never runs a verb its rules would refuse. The lint forbids any other
 * `.perform(` in the game but `dispatch`'s.
 */

export interface Running {
  readonly state: GameState;
  readonly ctx: GameContext;
  readonly rng: Rng;
}

export function performChecked<A extends GameAction>(
  handler: ActionHandler<A>,
  action: A,
  { state, ctx, rng }: Running,
): GameState {
  const blocker = handler.check(state, action, ctx);
  // The caller's own check should have refused first: running on is a programmer's error.
  if (blocker) throw new Error(`"${action.type}" was run when its check says: ${blocker}`);
  return handler.perform(state, action, ctx, rng);
}
