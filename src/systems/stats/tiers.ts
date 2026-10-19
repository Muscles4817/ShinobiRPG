import type { StatId, Stats } from './stats';

/**
 * A frame of reference for stat numbers: a letter grade, and words for what the grade means for
 * that kind of stat. Skills read against the ordinary shinobi of each rank (an average, never a
 * cap: anyone may hold any grade); the body reads against real athletes; the mind is individual.
 * One overall fighting rating is built from them, so you (and your opponents) can be compared at
 * a glance. See `docs/design/stat-model-plan.md`.
 */

export const STAT_GRADES = ['E', 'D', 'C', 'B', 'A', 'S'] as const;
export type StatGrade = (typeof STAT_GRADES)[number];

/** No stat goes past this: the top of S, the gods among men. */
export const STAT_MAX = 60;

export interface StatTier {
  readonly min: number;
  readonly grade: StatGrade;
}

/** Ascending. A fresh graduate's skills sit around 5 (E); S runs from 40 to `STAT_MAX`. */
export const STAT_TIERS: readonly StatTier[] = [
  { min: 0, grade: 'E' },
  { min: 8, grade: 'D' },
  { min: 13, grade: 'C' },
  { min: 20, grade: 'B' },
  { min: 28, grade: 'A' },
  { min: 40, grade: 'S' },
];

/** How a stat's grade is read: a skill by rank, the body by athletes, the mind by people. */
export const STAT_READINGS = ['skill', 'body', 'mind'] as const;
export type StatReading = (typeof STAT_READINGS)[number];

/** Chakra control has a talent in it, but it is trained like an art, so it reads as a skill. */
export const STAT_READING: Readonly<Record<StatId, StatReading>> = {
  strength: 'body',
  speed: 'body',
  stamina: 'body',
  reserves: 'body',
  chakraControl: 'skill',
  intellect: 'mind',
  perception: 'mind',
  willpower: 'mind',
  taijutsu: 'skill',
  ninjutsu: 'skill',
  genjutsu: 'skill',
  kenjutsu: 'skill',
  fuuinjutsu: 'skill',
};

/** What each grade means, by reading. A skill's words are the rank whose average it is. */
const GRADE_WORDS: Readonly<Record<StatReading, Readonly<Record<StatGrade, string>>>> = {
  skill: {
    E: 'Genin',
    D: 'Good genin',
    C: 'Chūnin',
    B: 'Jōnin',
    A: 'Good jōnin',
    S: 'Elite',
  },
  body: {
    E: 'Ordinary',
    D: 'Athletic',
    C: 'Fine athlete',
    B: 'National class',
    A: 'World class',
    S: 'Beyond human',
  },
  mind: {
    E: 'Ordinary',
    D: 'Good',
    C: 'Strong',
    B: 'Exceptional',
    A: 'Rare',
    S: 'Peerless',
  },
};

export interface TierRead {
  readonly grade: StatGrade;
  /** What the grade means for this kind of stat, e.g. "Chūnin" or "World class". */
  readonly words: string;
  /** "Chūnin C". */
  readonly label: string;
  /** The value this grade begins at. */
  readonly min: number;
  /** How far through this grade towards the next, 0–1 (1 at the top). */
  readonly progress: number;
  /** The next grade up and the value that reaches it; null at the top. */
  readonly next: { readonly label: string; readonly at: number } | null;
}

function labelOf(grade: StatGrade, reading: StatReading): string {
  return `${GRADE_WORDS[reading][grade]} ${grade}`;
}

/** A value's grade, read as a skill unless said otherwise. */
export function statTier(value: number, reading: StatReading = 'skill'): TierRead {
  const index = STAT_TIERS.reduce((found, tier, i) => (value >= tier.min ? i : found), 0);
  const tier = STAT_TIERS[index] ?? { min: 0, grade: 'E' };
  const next = STAT_TIERS[index + 1];
  const top = next?.min ?? STAT_MAX;
  const progress = Math.min(1, (value - tier.min) / (top - tier.min));
  return {
    grade: tier.grade,
    words: GRADE_WORDS[reading][tier.grade],
    label: labelOf(tier.grade, reading),
    min: tier.min,
    progress: Math.max(0, progress),
    next: next ? { label: labelOf(next.grade, reading), at: next.min } : null,
  };
}

/** A stat's grade, read the way that stat is read. */
export function statTierOf(id: StatId, value: number): TierRead {
  return statTier(value, STAT_READING[id]);
}

/** A value kept within the scale. */
export function withinScale(value: number): number {
  return Math.min(STAT_MAX, Math.max(0, value));
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
