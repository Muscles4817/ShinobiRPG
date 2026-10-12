import { clamp, round2, type Rng } from '@/core';

import { STAT_IDS, type StatId } from './stats';

/**
 * Talent: a hidden growth multiplier per stat. About 1 is ordinary, up to `APTITUDE_MAX` a
 * prodigy, and 0 means the art will never take. It multiplies every growth source, so with
 * efficiency falling by grade a low aptitude is a natural ceiling. Players find it out by
 * training (`aptitudeBand` is the rough read they get), never as a number.
 */

export type Aptitude = Readonly<Record<StatId, number>>;

/** How much a character knows of their aptitude in a stat. */
export const APTITUDE_READS = ['unknown', 'sense', 'known'] as const;
export type AptitudeRead = (typeof APTITUDE_READS)[number];
export type AptitudeKnown = Readonly<Record<StatId, AptitudeRead>>;

/** The rough reads a player can get. */
export const APTITUDE_BANDS = ['none', 'poor', 'ordinary', 'gifted'] as const;
export type AptitudeBand = (typeof APTITUDE_BANDS)[number];

export const APTITUDE_MAX = 1.8;
/** Below this an aptitude reads as poor; from `GIFTED_FROM` up, gifted. */
const POOR_BELOW = 0.8;
const GIFTED_FROM = 1.25;

interface Range {
  readonly floor: number;
  readonly ceiling: number;
}

/** A prodigy's draw and a hole's draw, used instead of the usual range when luck says so. */
const PRODIGY_RANGE: Range = { floor: 1.4, ceiling: APTITUDE_MAX };
const HOLE_RANGE: Range = { floor: 0.25, ceiling: 0.55 };

/** The odds for one stat: a uniform draw between floor and ceiling, with chances to be exceptional. */
export interface AptitudeOdds extends Range {
  /** Chance of a prodigy's draw instead. */
  readonly prodigy?: number;
  /** Chance of a hole's draw instead. */
  readonly hole?: number;
  /** Multiplies the draw (an identity that grows this stat faster or slower). */
  readonly tilt?: number;
  /** The result never falls below this (e.g. a talent in this stat). */
  readonly atLeast?: number;
}

function rangeFor(luck: number, odds: AptitudeOdds): Range {
  const prodigy = odds.prodigy ?? 0;
  if (luck < prodigy) return PRODIGY_RANGE;
  return luck < prodigy + (odds.hole ?? 0) ? HOLE_RANGE : odds;
}

/** Rolls one stat's aptitude. Always draws twice, so the rolls after it stay in step. */
export function rollOne(rng: Rng, odds: AptitudeOdds): number {
  const range = rangeFor(rng.next(), odds);
  const drawn = range.floor + (range.ceiling - range.floor) * rng.next();
  const tilted = drawn * (odds.tilt ?? 1);
  return round2(clamp(Math.max(tilted, odds.atLeast ?? 0), 0, APTITUDE_MAX));
}

/** Rolls every stat's aptitude, in `STAT_IDS` order. */
export function rollAptitude(rng: Rng, odds: (stat: StatId) => AptitudeOdds): Aptitude {
  const rolled = STAT_IDS.map((id) => [id, rollOne(rng, odds(id))] as const);
  return Object.fromEntries(rolled) as Record<StatId, number>;
}

export function aptitudeBand(value: number): AptitudeBand {
  if (value <= 0) return 'none';
  if (value < POOR_BELOW) return 'poor';
  return value < GIFTED_FROM ? 'ordinary' : 'gifted';
}

/** The same aptitude in every stat. */
export function evenAptitude(value: number): Aptitude {
  return Object.fromEntries(STAT_IDS.map((id) => [id, value])) as Record<StatId, number>;
}

/** Nothing known yet about any stat. */
export function nothingKnown(): AptitudeKnown {
  const reads = STAT_IDS.map((id) => [id, 'unknown'] as const);
  return Object.fromEntries(reads) as Record<StatId, AptitudeRead>;
}
