import type { StatId, Stats } from './stats';

/**
 * A frame of reference for stat numbers: a letter grade with the shinobi rank it belongs to
 * (E–D genin, C chūnin, B–A jōnin, S kage), and one overall fighting rating built from them,
 * so you (and your opponents) can be compared at a glance.
 */

export const STAT_GRADES = ['E', 'D', 'C', 'B', 'A', 'S'] as const;
export type StatGrade = (typeof STAT_GRADES)[number];

export interface StatTier {
  readonly min: number;
  readonly grade: StatGrade;
  /** The shinobi rank this grade belongs to. */
  readonly rank: string;
}

/** Ascending. A fresh graduate sits around 5 (E); academy-level enemies 3–10. */
export const STAT_TIERS: readonly StatTier[] = [
  { min: 0, grade: 'E', rank: 'Genin' },
  { min: 8, grade: 'D', rank: 'Genin' },
  { min: 13, grade: 'C', rank: 'Chūnin' },
  { min: 20, grade: 'B', rank: 'Jōnin' },
  { min: 28, grade: 'A', rank: 'Jōnin' },
  { min: 40, grade: 'S', rank: 'Kage' },
];

export interface TierRead {
  readonly grade: StatGrade;
  /** "D · Genin". */
  readonly label: string;
  /** The next grade up and the value that reaches it; null at the top. */
  readonly next: { readonly label: string; readonly at: number } | null;
}

function labelOf(tier: StatTier): string {
  return `${tier.grade} · ${tier.rank}`;
}

export function statTier(value: number): TierRead {
  const index = STAT_TIERS.reduce((found, tier, i) => (value >= tier.min ? i : found), 0);
  const tier = STAT_TIERS[index] ?? { min: 0, grade: 'E', rank: 'Genin' };
  const next = STAT_TIERS[index + 1];
  return {
    grade: tier.grade,
    label: labelOf(tier),
    next: next ? { label: labelOf(next), at: next.min } : null,
  };
}

const BODY_AND_MIND: readonly StatId[] = [
  'strength',
  'speed',
  'stamina',
  'chakraControl',
  'intellect',
  'perception',
  'willpower',
];
const ARTS: readonly StatId[] = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'];

/**
 * One number for how dangerous someone is in a fight: half their all-round body and mind,
 * half their best art (a specialist is as dangerous as their speciality).
 */
export function fightingPower(stats: Stats): number {
  const rounded = BODY_AND_MIND.reduce((sum, id) => sum + stats[id], 0) / BODY_AND_MIND.length;
  const best = Math.max(...ARTS.map((id) => stats[id]));
  return (rounded + best) / 2;
}
