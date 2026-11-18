import type { StatGrade } from '@/systems/stats';
import type { AreaSize } from '@/systems/techniques';

import type { CombatTechnique } from '../contract';

/**
 * Chakra's ebb and flow in a fight. A technique that covers more ground costs more to mould
 * (`AREA_COST`, on top of its authored cost), so the great sweeping techniques can't be thrown
 * every exchange. Every fighter gathers a little chakra back each exchange, a little more the
 * deeper the well, but only by its doublings (`REGEN_PER_DOUBLING`), never as a share of it: a
 * deep well lasts longer, it doesn't refill like a spring (the jutsu audit,
 * `prototypes/jutsu-audit/RESULTS.md`, found a share let a kage regain an S-rank technique every
 * exchange).
 */

/**
 * The least a technique of each rank costs to mould (before its user's control takes some off),
 * whatever its authored cost says (`docs/design/defence-plan.md`, slice 5): a jōnin's best
 * technique takes a real share of a full tank (about a quarter of a jōnin's), so a fighter who
 * throws their finest twice runs low and has to gather or lean on cheaper moves. E and D
 * techniques keep the costs they were written with.
 */
export const RANK_COST_FLOOR: Readonly<Record<StatGrade, number>> = {
  E: 0,
  D: 0,
  C: 10,
  B: 18,
  A: 30,
  S: 45,
};

/** A technique's cost before its user's control: what it was written with, or its rank's floor. */
export function rankedCost(t: { readonly chakraCost: number; readonly rank?: StatGrade }): number {
  return Math.max(t.chakraCost, RANK_COST_FLOOR[t.rank ?? 'E']);
}

/** How much more an area technique costs, by the ground it covers. */
export const AREA_COST: Readonly<Record<AreaSize, number>> = { small: 1, wide: 1.5, vast: 2.2 };

/** Chakra everyone gathers each exchange… */
export const CHAKRA_REGEN = 2;
/** …and this much more for every doubling of their full tank past `REGEN_FROM`. */
export const REGEN_PER_DOUBLING = 1.5;
const REGEN_FROM = 100;

/** How much more a technique costs for the ground it covers. */
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
