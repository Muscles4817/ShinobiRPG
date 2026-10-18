import { clamp } from '@/core';
import type { StatId } from '@/systems/stats';

import type { CompanionHunger } from './care';
import type { CompanionTemperament } from './companions';

/**
 * A companion's body grows with time, not training (`docs/design/retinue-plan.md`): its kind
 * sets an adult body and how long it takes to reach it, each animal's genes roll that body a
 * little up or down (a rougher roll for a stray, a kennel's line never below its kind), and a
 * day of growing counts whole when fed, half when hungry, not at all when starving. Its senses
 * grow most of the way on their own and the rest is scent work. Nothing passes the ceiling its
 * body sets: a hound will never be as strong as a bear, however it is trained.
 */

/** The stats a body grows into. */
export const BODY_STATS = ['strength', 'speed', 'stamina', 'perception'] as const;
export type BodyStat = (typeof BODY_STATS)[number];

/** Body stats training never moves: they come with time. Perception (scent work) can be trained. */
export const GROWN_ONLY: readonly StatId[] = ['strength', 'speed', 'stamina'];

export const LIFE_STAGES = ['pup', 'young', 'grown'] as const;
export type LifeStage = (typeof LIFE_STAGES)[number];

/** Growth before which it is a pup (too young to fight), and after which it is grown. */
const YOUNG_FROM = 0.4;
/** A newborn's body, as a share of the grown one. */
const JUVENILE_SHARE = 0.4;
/** How much of its adult senses grow on their own; scent work trains the rest. */
const SENSES_GROWN_SHARE = 0.7;
/** How far past its adult body conditioning and training can take a stat: never further. */
const CEILING_SHARE = 1.2;

/** How a day of growing counts at each stage of hunger. */
const GROWING_DAY: Readonly<Record<CompanionHunger, number>> = {
  fed: 1,
  peckish: 1,
  hungry: 0.5,
  starving: 0,
};

/** The spread of an animal's genes around its kind's body, by how it was bred. */
const GENES: Readonly<Record<CompanionTemperament, readonly [number, number]>> = {
  bred: [1, 1.15],
  stray: [0.8, 1.05],
  wild: [0.85, 1.15],
};

/** A day of growing, at this hunger. */
export function growingDay(hunger: CompanionHunger): number {
  return GROWING_DAY[hunger];
}

/** How grown it is, 0 (newborn) to 1 (adult). */
export function maturity(grownDays: number, maturesInDays: number): number {
  return clamp(grownDays / maturesInDays, 0, 1);
}

export function lifeStage(grown: number): LifeStage {
  if (grown >= 1) return 'grown';
  return grown >= YOUNG_FROM ? 'young' : 'pup';
}

/** Whether it is old enough to fight beside you. */
export function oldEnoughToFight(stage: LifeStage): boolean {
  return stage !== 'pup';
}

/** Days of growing it arrives with, joining at this share of the way to adult. */
export function grownDaysAt(share: number, maturesInDays: number): number {
  return Math.round(share * maturesInDays);
}

/** Its genes for one stat, from a hash in 0–1: a multiplier on its kind's adult body. */
export function genesFrom(unit: number, temperament: CompanionTemperament): number {
  const [low, high] = GENES[temperament];
  return low + (high - low) * unit;
}

/** What its body gives a stat at this maturity: fast at first, easing as it fills out. */
export function bodyValue(stat: BodyStat, adult: number, genes: number, grown: number): number {
  const target = adult * genes * (stat === 'perception' ? SENSES_GROWN_SHARE : 1);
  const eased = 1 - (1 - grown) ** 2;
  return target * (JUVENILE_SHARE + (1 - JUVENILE_SHARE) * eased);
}

/** The most a stat can ever be for this body. */
export function bodyCeiling(adult: number, genes: number): number {
  return adult * genes * CEILING_SHARE;
}
