import type { StatId, Stats } from './stats';

/**
 * A frame of reference for stat numbers: what a value means in shinobi terms, and one overall
 * fighting rating built from them, so you (and your opponents) can be compared at a glance.
 */

export interface StatTier {
  readonly min: number;
  readonly label: string;
}

/** Ascending. A fresh graduate sits around 5; academy-level enemies 3–8. */
export const STAT_TIERS: readonly StatTier[] = [
  { min: 0, label: 'Untrained' },
  { min: 4, label: 'Academy level' },
  { min: 7, label: 'Genin level' },
  { min: 10, label: 'Seasoned genin' },
  { min: 15, label: 'Chūnin level' },
  { min: 23, label: 'Jōnin level' },
  { min: 35, label: 'Kage level' },
];

export interface TierRead {
  readonly label: string;
  /** The next tier up and the value that reaches it; null at the top. */
  readonly next: { readonly label: string; readonly at: number } | null;
}

export function statTier(value: number): TierRead {
  const index = STAT_TIERS.reduce((found, tier, i) => (value >= tier.min ? i : found), 0);
  const next = STAT_TIERS[index + 1];
  return {
    label: STAT_TIERS[index]?.label ?? 'Untrained',
    next: next ? { label: next.label, at: next.min } : null,
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
