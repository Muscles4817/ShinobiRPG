import { sumDeltas, type StatDelta, type StatId } from '@/systems/stats';

import {
  developmentBonuses,
  developmentCost,
  developmentProblems,
  pointsIn,
  type Development,
  type DevelopmentAllowance,
} from './development';
import {
  flawsTaken,
  giftPoints,
  giftProblems,
  giftsAllowed,
  giftsSpent,
  giftStartBonuses,
  type Bloom,
  type Gifts,
} from './gifts';
import { STANDING_INFO, type ClassStanding } from './standing';

/**
 * The academy file as a whole: early training, known gifts and flaws, and when you bloomed,
 * spent against what your standing and your upbringing allow. One place answers what it costs,
 * what is left and why it isn't allowed.
 */

export interface AcademyFile {
  readonly development: Development;
  readonly gifts: Gifts;
  readonly bloom: Bloom;
}

/** Early training from how you were raised; some of it must have gone into `focus`. */
export interface EarlyTraining {
  readonly points: number;
  readonly focus?: { readonly stats: readonly StatId[]; readonly points: number };
}

export const BLANK_FILE: AcademyFile = { development: {}, gifts: {}, bloom: 'on-time' };

/** Development points and high stats on offer for this file. */
export function fileAllowance(
  file: AcademyFile,
  standing: ClassStanding,
  early: EarlyTraining,
): DevelopmentAllowance {
  const { development } = STANDING_INFO[standing];
  return {
    points: development.points + early.points + giftPoints(file.gifts, file.bloom),
    highStats: development.highStats,
  };
}

/** What is left to spend: points, gifts and flaws. */
export interface FileBalance {
  readonly points: number;
  readonly gifts: number;
  readonly flaws: number;
}

export function fileBalance(
  file: AcademyFile,
  standing: ClassStanding,
  early: EarlyTraining,
): FileBalance {
  const { gifts } = STANDING_INFO[standing];
  return {
    points: fileAllowance(file, standing, early).points - developmentCost(file.development),
    gifts: giftsAllowed(gifts, file.bloom) - giftsSpent(file.gifts),
    flaws: gifts.flaws - flawsTaken(file.gifts),
  };
}

/** Everything wrong with a file (empty when it is allowed). */
export function fileProblems(
  file: AcademyFile,
  standing: ClassStanding,
  early: EarlyTraining,
): string[] {
  const focus = early.focus;
  const unfocused =
    focus !== undefined && pointsIn(file.development, focus.stats) < focus.points
      ? [`Your upbringing put at least ${focus.points} points of training into its arts.`]
      : [];
  return [
    ...developmentProblems(file.development, fileAllowance(file, standing, early)),
    ...giftProblems(file.gifts, STANDING_INFO[standing].gifts, file.bloom),
    ...unfocused,
  ];
}

/** The stat points the file adds at graduation. */
export function fileStartBonuses(file: AcademyFile): StatDelta {
  return sumDeltas(developmentBonuses(file.development), giftStartBonuses(file.gifts));
}
