import type { GameContext } from './context';
import type { GameState } from './state';

/**
 * The village you belong to: where your rented home is. Every save today lives in its pack's
 * start village, but nothing about being home should assume it, so a pack may one day offer
 * another village to start in.
 */
export function homeVillageId(state: Pick<GameState, 'housing'>, ctx: GameContext): string {
  return state.housing.villageId ?? ctx.content.startLocationId;
}

export function atHomeVillage(
  state: Pick<GameState, 'housing' | 'locationId'>,
  ctx: GameContext,
): boolean {
  return state.locationId === homeVillageId(state, ctx);
}
