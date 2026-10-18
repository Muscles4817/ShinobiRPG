import { hashUnit } from '@/core';
import type { CompanionKindDef, StrayHaunt } from '@/content';

import type { GameContext } from '../context';
import { atHomeVillage } from '../homeVillage';
import type { GameState } from '../state';
import { playerCompanion } from './make';

/**
 * Strays in the village (`CompanionKindDef.stray`): not every save meets one (the kind's
 * `chance`, read from the seed), and one that does sees it on some days, at one of its haunts.
 * Only someone without a companion notices one; the stray you are winning over keeps coming
 * back. Like the board, it hashes the seed and the day, never the Rng.
 */

/** The share of days a stray this save meets is about. */
const STRAY_DAY_CHANCE = 0.4;

export interface StrayToday {
  readonly kind: CompanionKindDef & { readonly stray: StrayHaunt };
  readonly placeId: string;
}

function strayKinds(ctx: GameContext): (CompanionKindDef & { readonly stray: StrayHaunt })[] {
  return ctx.content.companionKinds.all.flatMap((k) => (k.stray ? [{ ...k, stray: k.stray }] : []));
}

/** The stray about in your village today, and where, if any. */
export function strayToday(state: GameState, ctx: GameContext): StrayToday | null {
  if (playerCompanion(state) || !atHomeVillage(state, ctx)) return null;
  const { seed } = state.board;
  const day = state.time.day;
  const befriending = state.companions.befriending?.kindId;
  const kind = strayKinds(ctx).find(
    (k) => k.id === befriending || hashUnit(seed, 'stray', k.id) < k.stray.chance,
  );
  if (!kind || hashUnit(seed, day, 'stray-about', kind.id) >= STRAY_DAY_CHANCE) return null;
  const places = kind.stray.placeIds;
  const placeId = places[Math.floor(hashUnit(seed, day, 'stray-at', kind.id) * places.length)];
  return placeId ? { kind, placeId } : null;
}
