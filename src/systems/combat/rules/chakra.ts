import type { AreaSize } from '@/systems/techniques';

import type { CombatTechnique } from '../contract';

/**
 * Chakra's ebb and flow in a fight. What a technique costs is what it does (`worth.ts`), never
 * its rank. Every fighter gathers a little chakra back each exchange, a little more the
 * deeper the well, but only by its doublings (`REGEN_PER_DOUBLING`), never as a share of it: a
 * deep well lasts longer, it doesn't refill like a spring (the jutsu audit,
 * `prototypes/jutsu-audit/RESULTS.md`, found a share let a kage regain an S-rank technique every
 * exchange).
 */

/** How much more breath a body move costs for the ground it covers (chakra reads `worth.ts`). */
export const AREA_COST: Readonly<Record<AreaSize, number>> = { small: 1, wide: 1.5, vast: 2.2 };

/** Chakra everyone gathers each exchange… */
export const CHAKRA_REGEN = 2;
/** …and this much more for every doubling of their full tank past `REGEN_FROM`. */
export const REGEN_PER_DOUBLING = 1.5;
const REGEN_FROM = 100;

/** How much more breath a body move costs for the ground it covers. */
export function areaCostScale(t: { readonly effects?: CombatTechnique['effects'] }): number {
  const area = t.effects?.find((e) => e.verb === 'area');
  return area?.verb === 'area' ? AREA_COST[area.size ?? 'small'] : 1;
}

/** Chakra after an exchange's gathering. */
export function gathered(f: { readonly chakra: number; readonly maxChakra: number }): number {
  const doublings = Math.max(0, Math.log2(f.maxChakra / REGEN_FROM));
  const regen = CHAKRA_REGEN + Math.round(doublings * REGEN_PER_DOUBLING);
  return Math.min(f.maxChakra, f.chakra + regen);
}
