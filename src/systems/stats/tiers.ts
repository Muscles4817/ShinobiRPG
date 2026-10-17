import type { Stats } from './stats';

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
  /** The shinobi rank the grade belongs to, e.g. "Genin". */
  readonly rank: string;
  /** "Genin D". */
  readonly label: string;
  /** The value this grade begins at. */
  readonly min: number;
  /** How far through this grade towards the next, 0–1 (1 at the top). */
  readonly progress: number;
  /** The next grade up and the value that reaches it; null at the top. */
  readonly next: { readonly label: string; readonly at: number } | null;
}

function labelOf(tier: StatTier): string {
  return `${tier.rank} ${tier.grade}`;
}

export function statTier(value: number): TierRead {
  const index = STAT_TIERS.reduce((found, tier, i) => (value >= tier.min ? i : found), 0);
  const tier = STAT_TIERS[index] ?? { min: 0, grade: 'E', rank: 'Genin' };
  const next = STAT_TIERS[index + 1];
  const progress = next ? Math.min(1, (value - tier.min) / (next.min - tier.min)) : 1;
  return {
    grade: tier.grade,
    rank: tier.rank,
    label: labelOf(tier),
    min: tier.min,
    progress: Math.max(0, progress),
    next: next ? { label: labelOf(next), at: next.min } : null,
  };
}

/**
 * Reserves are left out: they say how long someone can keep using jutsu, not how dangerous each
 * exchange with them is, and an enemy's chakra is authored apart from their stats.
 */
const BODY_AND_MIND = [
  'strength',
  'speed',
  'stamina',
  'chakraControl',
  'intellect',
  'perception',
  'willpower',
] as const;
const ARTS = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'] as const;

/** The stats a fighting rating reads (everything but reserves). */
export type FightingStats = Pick<Stats, (typeof BODY_AND_MIND)[number] | (typeof ARTS)[number]>;

/**
 * One number for how dangerous someone is in a fight: half their all-round body and mind,
 * half their best art (a specialist is as dangerous as their speciality).
 */
export function fightingPower(stats: FightingStats): number {
  const rounded = BODY_AND_MIND.reduce((sum, id) => sum + stats[id], 0) / BODY_AND_MIND.length;
  const best = Math.max(...ARTS.map((id) => stats[id]));
  return (rounded + best) / 2;
}

/**
 * How strongly extra bodies add up, measured on the bench (`retinueBench.test.ts`): fights are
 * steep, so even a weak second body is a real threat, but two bodies are not twice one.
 */
const PARTY_EXPONENT = 1.5;

/**
 * One rating for several bodies fighting as one (a fighter and their companions), on the same
 * scale as `fightingPower`: the strongest alone is their own rating, and each body beside them
 * adds to it.
 */
export function partyPower(powers: readonly number[]): number {
  const sum = powers.reduce((total, p) => total + Math.max(0, p) ** PARTY_EXPONENT, 0);
  return sum ** (1 / PARTY_EXPONENT);
}
