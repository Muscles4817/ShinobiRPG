import { RANKS } from '@/systems/standing';
import { passValid } from '@/systems/travel';

import type { GameContext } from '../context';
import { wildsHere } from '../gathering';
import { laidUp } from '../injuries';
import { busyReason, firstBlocker } from '../ops';
import type { GameState } from '../state';
import { deepWildsOf, goInto } from '../ventures';
import type { ActionHandler, ActionOf } from './types';

/**
 * Going off the paths into wild country from a wild place (`game/ventures.ts`). The edge is
 * anyone's. The deep takes days, so a genin goes only on their sensei's pass; the heart is for
 * chūnin and up.
 */

export const NEEDS_PASS_FOR_DEEP =
  'A genin goes as far as the deep only on a pass your sensei signs at your weekly lesson.';
export const HEART_IS_FOR_CHUNIN = 'Only a chūnin or higher goes into the heart of wild country.';

function depthBlocker(state: GameState, depth: ActionOf<'venture'>['depth']): string | null {
  const rank = RANKS.indexOf(state.standing.rank);
  if (rank >= RANKS.indexOf('chunin') || depth === 'edge') return null;
  if (depth === 'heart') return HEART_IS_FOR_CHUNIN;
  return passValid(state.leave, state.time.day) ? null : NEEDS_PASS_FOR_DEEP;
}

function countryHere(state: GameState, ctx: GameContext, placeId: string) {
  const place = wildsHere(state, ctx, placeId);
  return place ? deepWildsOf(ctx, place.biome) : null;
}

export const venture: ActionHandler<ActionOf<'venture'>> = {
  check(state, { placeId, depth }, ctx) {
    return firstBlocker(
      busyReason(state),
      countryHere(state, ctx, placeId) === null && 'There is no way further in from here.',
      laidUp(state, ctx),
      depthBlocker(state, depth),
    );
  },
  perform(state, { placeId, depth }, ctx) {
    const country = countryHere(state, ctx, placeId);
    if (!country) return state;
    return goInto(state, ctx, { placeId, country: country.biome, depth });
  },
};
