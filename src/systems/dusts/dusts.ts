import { clamp } from '@/core';

/**
 * Commanded dust between fights (`docs/design/retinue-plan.md`, step 4e): the store a user
 * carries (a gourd, a pouch, a sealed scroll) and how much of it there is. How much a user can
 * hold up grows with their chakra. What came back from a fight is what the store holds. Dust
 * the ground gives (sand, ash) gathers itself again day by day, quickly at home; dust no
 * ground gives (iron sand, gold, glass) never comes back on its own: it is made or bought.
 */

/** The dust a user carries between fights. */
export interface DustStore {
  /** The kind (a `DustDef` id). */
  readonly dustId: string;
  readonly count: number;
}

/** Dust held up per point of full chakra. */
export const DUST_PER_CHAKRA = 2;
/** Share of the store a drawable dust gathers back in a day at home. */
export const GATHER_AT_HOME = 0.5;
/** Share it gathers back in a day away (a strange ground, a road). */
export const GATHER_AWAY = 0.15;

/** As much dust as a body of this full chakra can hold up at once. */
export function storeCap(fullChakra: number): number {
  return Math.round(fullChakra * DUST_PER_CHAKRA);
}

/** A full store of a kind, for a body of this chakra. */
export function fullStore(dustId: string, fullChakra: number): DustStore {
  return { dustId, count: storeCap(fullChakra) };
}

/** The store after a fight: what came back, never past the cap. */
export function storeAfterFight(store: DustStore, left: number, cap: number): DustStore {
  return { ...store, count: clamp(Math.round(left), 0, cap) };
}

/** A day passing: dust the ground gives gathers back; dust it doesn't stays as it is. */
export function gathered(
  store: DustStore,
  cap: number,
  day: { readonly atHome: boolean; readonly drawable: boolean },
): DustStore {
  if (!day.drawable || store.count >= cap) return store;
  const share = day.atHome ? GATHER_AT_HOME : GATHER_AWAY;
  return { ...store, count: Math.min(cap, store.count + Math.round(cap * share)) };
}
