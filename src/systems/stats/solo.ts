import { clamp } from '@/core';

import type { StatId } from './stats';
import { STAT_GRADES, STAT_TIERS, type StatGrade } from './tiers';

/**
 * How much a session of practice alone still does at a stat's grade: effective at E, mild at
 * D and far too slow to fill C. Hard-work traits can hold a floor under it.
 */

/** Share of a session's gain solo practice keeps at each grade of the stat being trained. */
export const SOLO_EFFICIENCY: Readonly<Record<StatGrade, number>> = {
  E: 1,
  D: 0.4,
  C: 0.1,
  B: 0.03,
  A: 0.01,
  S: 0.003,
};

/**
 * Over this top share of a grade's band, efficiency eases (geometrically) down to the next
 * grade's value, so there is no cliff at a boundary to game: one session more or less near
 * the edge changes almost nothing.
 */
export const EASE_SHARE = 0.4;

/** A hard-work floor: solo efficiency never drops below `floor` while the stat is at or below `throughGrade`. */
export interface SoloFloor {
  readonly floor: number;
  readonly throughGrade: StatGrade;
}

export type SoloFloors = Readonly<Partial<Record<StatId, readonly SoloFloor[]>>>;

function tierIndexAt(value: number): number {
  return STAT_TIERS.reduce((found, tier, i) => (value >= tier.min ? i : found), 0);
}

function floorAt(grade: StatGrade, floors: readonly SoloFloor[]): number {
  const at = STAT_GRADES.indexOf(grade);
  return floors.reduce(
    (best, f) => (at <= STAT_GRADES.indexOf(f.throughGrade) ? Math.max(best, f.floor) : best),
    0,
  );
}

/** Share of a session's gain solo practice keeps at this stat value (see `EASE_SHARE`). */
export function soloEfficiency(value: number, floors: readonly SoloFloor[] = []): number {
  const index = tierIndexAt(value);
  const tier = STAT_TIERS[index] ?? { min: 0, grade: 'E' as const };
  const next = STAT_TIERS[index + 1];
  const here = SOLO_EFFICIENCY[tier.grade];
  const floor = floorAt(tier.grade, floors);
  if (!next) return Math.max(here, floor);
  const easeFrom = next.min - (next.min - tier.min) * EASE_SHARE;
  const t = clamp((value - easeFrom) / (next.min - easeFrom), 0, 1);
  const eased = here * (SOLO_EFFICIENCY[next.grade] / here) ** t;
  return Math.max(eased, floor);
}
