import { clamp, hashUnit } from '@/core';
import type { CompanionKindDef, WildHaunt } from '@/content';

import type { GameContext } from '../context';
import { wildsHere } from '../gathering';
import type { GameState } from '../state';
import { playerCompanion } from './make';

/**
 * Wild ones in the wilds (`CompanionKindDef.wild`): a kind lives in some wild places of its
 * biome, read from the seed and the place (not every woods has a wolf), and leaves signs there
 * for anyone without a companion to follow (a changed kind, only once you have met its kind). Tracking it is a day's work with a chance of getting
 * closer that sharp eyes raise; enough good days and it comes to you.
 */

/** A day's tracking gets closer this often, plus a share per point of perception. */
const TRACK_BASE = 0.2;
const TRACK_PER_PERCEPTION = 0.03;
/** Never a sure thing: some days the trail goes cold however sharp you are. */
const TRACK_MOST = 0.85;

export type WildKind = CompanionKindDef & { readonly wild: WildHaunt };

function wildKinds(ctx: GameContext): WildKind[] {
  return ctx.content.companionKinds.all.flatMap((k) => (k.wild ? [{ ...k, wild: k.wild }] : []));
}

/** A changed kind leaves signs only for someone who has fought one of its kind in the wild. */
function metItsKind(state: GameState, wild: WildHaunt): boolean {
  return wild.after === undefined || (state.fieldBook.foes[wild.after]?.fought ?? 0) > 0;
}

/** The wild one living at this wild place in this save, for someone without a companion. */
export function wildHere(state: GameState, ctx: GameContext, placeId: string): WildKind | null {
  const place = wildsHere(state, ctx, placeId);
  if (!place || playerCompanion(state)) return null;
  const { seed } = state.board;
  return (
    wildKinds(ctx).find(
      (k) =>
        k.wild.biome === place.biome &&
        metItsKind(state, k.wild) &&
        hashUnit(seed, 'wild', k.id, place.id) < k.wild.chance,
    ) ?? null
  );
}

/** How likely a day's tracking is to get closer, by your eyes. */
export function trackingChance(state: GameState): number {
  const perception = state.character.stats.perception;
  return clamp(TRACK_BASE + perception * TRACK_PER_PERCEPTION, 0, TRACK_MOST);
}
