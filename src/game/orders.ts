import { arcBases } from '@/systems/missions';

import type { GameContext } from './context';
import type { GameState } from './state';

/**
 * Being somewhere on your village's orders: a town where a long story's current act is based.
 * Going there needs no leave (`leave.ts`), and its hunters leave you be (`hunt.ts`).
 */
export function onOrders(state: GameState, ctx: GameContext, destinationId: string): boolean {
  return arcBases(ctx.content.arcs.all, state.board.completed).includes(destinationId);
}
