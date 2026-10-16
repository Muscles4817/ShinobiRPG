import type { AreaSize } from '@/systems/techniques';

import type { CombatTechnique } from '../contract';

/**
 * Chakra's ebb and flow in a fight. A technique that covers more ground costs more to mould
 * (`AREA_COST`, on top of its authored cost), so the great sweeping techniques can't be thrown
 * every exchange. Every fighter gathers chakra back each exchange, a little, or a share of
 * deep reserves (`REGEN_SHARE`), so a jōnin's or a kage's comes back faster: a big technique spends more than
 * an exchange gives back, and a fighter who has spent hard has to lean on cheaper moves for a
 * while before the next one.
 */

/** How much more an area technique costs, by the ground it covers. */
export const AREA_COST: Readonly<Record<AreaSize, number>> = { small: 1, wide: 1.5, vast: 2.2 };

/** Chakra everyone gathers each exchange at least… */
export const CHAKRA_REGEN = 2;
/** …or this share of their reserves, for deep ones. */
export const REGEN_SHARE = 0.025;

/** How much more a technique costs for the ground it covers. */
export function areaCostScale(t: { readonly effects?: CombatTechnique['effects'] }): number {
  const area = t.effects?.find((e) => e.verb === 'area');
  return area?.verb === 'area' ? AREA_COST[area.size ?? 'small'] : 1;
}

/** Chakra after an exchange's gathering. */
export function gathered(f: { readonly chakra: number; readonly maxChakra: number }): number {
  const regen = Math.max(CHAKRA_REGEN, Math.round(f.maxChakra * REGEN_SHARE));
  return Math.min(f.maxChakra, f.chakra + regen);
}
