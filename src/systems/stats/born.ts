import { round1 } from '@/core';

import type { StatId } from './stats';

/**
 * What someone is born with and grows into by graduation (16–19): the body and the mind, before
 * any academy file is laid over them. Bodies are read against real adults
 * (`docs/design/stat-model-plan.md`): a class median near an athletic young adult, a log-normal
 * spread so most sit between 4 and 14 and a rare few reach national class, and men a little
 * faster, markedly stronger and a little more enduring than women on average, with the curves
 * overlapping widely. The mind is individual and spread wider still. Skills are never born: they
 * start at the academy's line.
 */

export const SEXES = ['male', 'female'] as const;
export type Sex = (typeof SEXES)[number];

/** The stats a person is born with. */
export const BORN_STATS = [
  'strength',
  'speed',
  'stamina',
  'reserves',
  'intellect',
  'perception',
  'willpower',
] as const satisfies readonly StatId[];
export type BornStat = (typeof BORN_STATS)[number];
export type BornLine = Readonly<Record<BornStat, number>>;

/** A skill on graduation day, before the file: what every graduate has (E). */
export const ACADEMY_LINE = 5;

/** The class's median body, by sex: an academy-drilled young adult (D, athletic). */
const BODY_MEDIAN: Readonly<
  Record<Sex, Readonly<Record<'strength' | 'speed' | 'stamina', number>>>
> = {
  male: { strength: 8.5, speed: 8.5, stamina: 8.5 },
  female: { strength: 6, speed: 7.5, stamina: 7.5 },
};
/** Chakra reserves don't differ by sex. */
const RESERVES_MEDIAN = 6.5;
/** The median mind. */
const MIND_MEDIAN = 7;
/** Log-normal spreads: one standard deviation multiplies the median by e^sigma. */
const BODY_SIGMA = 0.28;
const MIND_SIGMA = 0.38;
/** Nobody graduates with less than this in anything. */
const BORN_FLOOR = 1;

/** The middle of the class, for someone whose body and mind haven't been drawn. */
export function bornMedian(sex: Sex): BornLine {
  return bornLine(sex, () => 0);
}

/**
 * A body and mind from standard normal draws, one per stat (`normal(stat)`): the median moved
 * by the draw's spread.
 */
export function bornLine(sex: Sex, normal: (stat: BornStat) => number): BornLine {
  const body = BODY_MEDIAN[sex];
  const at = (median: number, sigma: number, stat: BornStat) =>
    round1(Math.max(BORN_FLOOR, median * Math.exp(sigma * normal(stat))));
  return {
    strength: at(body.strength, BODY_SIGMA, 'strength'),
    speed: at(body.speed, BODY_SIGMA, 'speed'),
    stamina: at(body.stamina, BODY_SIGMA, 'stamina'),
    reserves: at(RESERVES_MEDIAN, BODY_SIGMA, 'reserves'),
    intellect: at(MIND_MEDIAN, MIND_SIGMA, 'intellect'),
    perception: at(MIND_MEDIAN, MIND_SIGMA, 'perception'),
    willpower: at(MIND_MEDIAN, MIND_SIGMA, 'willpower'),
  };
}

/** A standard normal draw from two uniform draws in (0, 1] (Box–Muller). */
export function normalFrom(u1: number, u2: number): number {
  return Math.sqrt(-2 * Math.log(Math.max(u1, Number.EPSILON))) * Math.cos(2 * Math.PI * u2);
}
