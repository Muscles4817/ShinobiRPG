import { fillSlots } from '@/core';

import type { GameContext } from '../context';
import { homeVillageId } from '../homeVillage';
import { placeInText } from '../placeName';
import type { GameState } from '../state';
import { tellFresh } from '../telling';

/**
 * Arriving at the end of a road: the last day's line ends somewhere by name, and the way home
 * reads as coming home. Lines are drawn without repeating the last few the player read.
 */

const HOME = {
  name: 'arrive-home',
  lines: [
    'By evening the lanterns are lit along the wall of {place}, and you walk in under them, home.',
    'The gate of {place} stands open when you reach it near dusk, and the guard waves you through without looking up from his tea.',
    'The last mile is the longest. Then {place} is round the bend, smoke going up from its kitchens, and you are home.',
    'You smell {place} before you see it, cookfires and wet cedar, and your feet find the way in on their own.',
  ],
} as const;

const AWAY = {
  name: 'arrive-away',
  lines: [
    'Before dark you come down into {place}, and walk the last stretch with the noise of the streets growing ahead of you.',
    'By dusk you are on the edge of {place}, asking a woman at a well for the way to an inn.',
    'The road widens, carts and walkers join it, and by late afternoon it has carried you into {place}.',
    'You reach {place} with the last of the light, footsore, and stand a moment at the first corner to take it in.',
  ],
} as const;

/** The line that ends a road at the location `id`, and the memory of having said it. */
export function arrivalLine(
  state: GameState,
  ctx: GameContext,
  id: string,
): { readonly text: string; readonly state: GameState } {
  const home = homeVillageId(state, ctx);
  const place = placeInText(ctx.content.locations.require(id).name);
  const bank = id === home ? HOME : AWAY;
  const told = tellFresh(state.told, bank, `${state.board.seed}|${state.time.day}|${id}`);
  const text = fillSlots(told.line, { place });
  return { text, state: { ...state, told: told.told } };
}
