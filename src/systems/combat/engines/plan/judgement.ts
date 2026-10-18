import { statTier, type StatGrade } from '@/systems/stats';

import type { PlanFighter } from './state';

/**
 * Judgement comes with a sharper mind. Intellect grade decides how closely a foe keeps to its
 * plan rather than acting on instinct, whether it turns what it has read of you into a choice
 * in the moment, how strongly its instincts lean on what beats your defence, and how much of
 * your fighting it must see before it rethinks its own defence between rounds. A dull brawler
 * swings by feel and learns slowly; a sharp jōnin plays its plan and answers your habits fast.
 */

type Judged = Pick<PlanFighter, 'attributes'>;

/** How often a foe plays its plan in priority order rather than on instinct. */
const PLAN_ADHERENCE: Readonly<Record<StatGrade, number>> = {
  E: 0.7,
  D: 0.7,
  C: 0.75,
  B: 0.8,
  A: 0.85,
  S: 0.9,
};

/** Attacks seen before a foe rethinks its defence between rounds. */
const ADAPT_AFTER: Readonly<Record<StatGrade, number>> = {
  E: 6,
  D: 4,
  C: 3,
  B: 2,
  A: 2,
  S: 1,
};

/** How much likelier instinct makes an attack that beats your seen defence. */
const BEATS_WEIGHT: Readonly<Record<StatGrade, number>> = {
  E: 1.25,
  D: 1.5,
  C: 2,
  B: 2.5,
  A: 3,
  S: 3,
};

/**
 * How hard instinct leans on what an attack is worth against this foe (`worth.ts`) over how
 * strong it is on paper: a dull brawler swings by feel, a sharp mind picks what works.
 */
const WORTH_SHARPNESS: Readonly<Record<StatGrade, number>> = {
  E: 0.5,
  D: 0.75,
  C: 1,
  B: 1.5,
  A: 2,
  S: 2.5,
};

/** The lowest grade that turns a read into a planned counter-pick in the moment. */
const READS_IN_THE_MOMENT: readonly StatGrade[] = ['D', 'C', 'B', 'A', 'S'];

function gradeOf(fighter: Judged): StatGrade {
  return statTier(fighter.attributes.intellect).grade;
}

export function planAdherence(fighter: Judged): number {
  return PLAN_ADHERENCE[gradeOf(fighter)];
}

export function adaptsAfter(fighter: Judged): number {
  return ADAPT_AFTER[gradeOf(fighter)];
}

export function beatsWeight(fighter: Judged): number {
  return BEATS_WEIGHT[gradeOf(fighter)];
}

export function worthSharpness(fighter: Judged): number {
  return WORTH_SHARPNESS[gradeOf(fighter)];
}

export function readsInTheMoment(fighter: Judged): boolean {
  return READS_IN_THE_MOMENT.includes(gradeOf(fighter));
}
