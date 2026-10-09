import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { blockerFor } from '../dispatch';
import type { GameState } from '../state';

/**
 * View models: plain, display-ready data derived from GameState. The UI renders these and
 * never reaches into systems or content itself, so their internals can change freely.
 */

/** Something the player can do, with why they can't right now (null when they can). */
export interface Choice {
  readonly action: GameAction;
  readonly blocker: string | null;
}

export function choice(state: GameState, ctx: GameContext, action: GameAction): Choice {
  return { action, blocker: blockerFor(state, action, ctx) };
}

export type { Discipline } from '@/systems/techniques';
