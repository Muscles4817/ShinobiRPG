import { hashUnit } from '@/core';
import type { CompanionKindDef } from '@/content';
import { bondGain, PLAYER_OWNER, withBond, type Companion } from '@/systems/companions';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { kindOf, playerCompanion } from './make';

/**
 * What care reads about your companion: its favourite food (one of its kind's diet, drawn from
 * the seed and its id, never the Rng), whether it is with you, and how bond from care lands
 * by its temperament.
 */

/** Its favourite food: one of its kind's diet, the same for its whole life. */
export function favouriteOf(companion: Companion, kind: CompanionKindDef, seed: number): string {
  const diet = kind.diet;
  const pick = Math.floor(hashUnit(seed, 'favourite', companion.id) * diet.length);
  return diet[pick] ?? diet[0] ?? '';
}

/** Your companion and its kind, when you have one. */
export function yourCompanion(
  state: GameState,
  ctx: GameContext,
): { readonly companion: Companion; readonly kind: CompanionKindDef } | null {
  const companion = playerCompanion(state);
  return companion ? { companion, kind: kindOf(companion, ctx) } : null;
}

/** The state with your companion changed. */
export function withCompanion(state: GameState, companion: Companion): GameState {
  const owned = { ...state.companions.owned, [PLAYER_OWNER]: companion };
  return { ...state, companions: { ...state.companions, owned } };
}

/** Your companion a little closer to you, as its temperament takes it. */
export function warmed(companion: Companion, kind: CompanionKindDef, base: number): Companion {
  return withBond(companion, bondGain(base, kind.temperament));
}
