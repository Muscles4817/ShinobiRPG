import type { GameContext } from '../context';
import { characterModifiers } from '../profile';
import type { GameState } from '../state';

/**
 * How much a moment with someone counts today. A shared, convivial meal (`bondGain`) makes
 * good time count for more; it never softens a falling-out.
 */
export function warmed(state: GameState, ctx: GameContext, delta: number): number {
  if (delta <= 0) return delta;
  return Math.round(delta * characterModifiers(state.character, ctx).bondGain);
}
