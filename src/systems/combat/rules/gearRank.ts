import type { GearRank } from '../gearContract';

/**
 * How far a piece's rank lifts it above a plain D-rank piece: 0 for D, 3 for A. Every gear
 * rule (`weapons.ts`, `armour.ts`, `focus.ts`) grows by this, so quality shows in the verbs.
 */
const RANK_STEP: Readonly<Record<GearRank, number>> = { D: 0, C: 1, B: 2, A: 3 };

export function rankStep(rank: GearRank): number {
  return RANK_STEP[rank];
}
