import { hashUnit } from '@/core';
import type { ModifierSpec } from '@/systems/modifiers';
import { STAT_IDS, type SoloFloor, type StatId } from '@/systems/stats';

import type { DevelopmentAllowance } from './development';
import type { GiftAllowance } from './gifts';

/**
 * Where a character stood in their academy class: dead last to the genius of the year. It is
 * the one choice at creation that is not a trade-off. It sets what you can do now (the points of
 * early training on your file, and how far along a stat may be) and what you could become (the
 * gifts you know of, and the band your hidden talent is rolled in), so it is how hard the game
 * is. The low end gets the hard-work route: training alone keeps paying off further than it
 * does for anyone else.
 */

export const CLASS_STANDINGS = ['dead-last', 'below-average', 'middle', 'top', 'genius'] as const;
export type ClassStanding = (typeof CLASS_STANDINGS)[number];

/** How a standing shifts the hidden talent roll (see `game/aptitude.ts`). */
export interface TalentBand {
  /** Multiplies every draw's range. */
  readonly scale: number;
  /** Added to the chance of a prodigy's draw in each stat. */
  readonly prodigy: number;
  /** Added to the chance of a hole in each stat. */
  readonly hole: number;
}

export interface StandingInfo {
  readonly label: string;
  /** How the instructors wrote it on the file. */
  readonly note: string;
  readonly development: DevelopmentAllowance;
  readonly gifts: GiftAllowance;
  readonly talent: TalentBand;
  readonly modifiers: ModifierSpec;
  /** How often fate deals this standing. */
  readonly fateWeight: number;
}

/** Hard work's floor for whoever finished at the bottom: solo practice keeps paying through C. */
function everyStat(floor: SoloFloor): Partial<Record<StatId, SoloFloor>> {
  return Object.fromEntries(STAT_IDS.map((id) => [id, floor]));
}

const DEAD_LAST_FLOOR: SoloFloor = { floor: 0.35, throughGrade: 'C' };
const BELOW_AVERAGE_FLOOR: SoloFloor = { floor: 0.2, throughGrade: 'C' };

export const STANDING_INFO: Readonly<Record<ClassStanding, StandingInfo>> = {
  'dead-last': {
    label: 'Dead last',
    note: 'Passed on the third attempt. Nobody expects anything, which is its own kind of freedom.',
    development: { points: 2, highStats: 0 },
    gifts: { gifts: 0, prodigy: false, flaws: 1 },
    talent: { scale: 0.75, prodigy: -1, hole: 0.1 },
    modifiers: { soloEfficiencyFloor: everyStat(DEAD_LAST_FLOOR) },
    fateWeight: 0.1,
  },
  'below-average': {
    label: 'Below average',
    note: 'Scraped through. Works hard, mostly to keep up.',
    development: { points: 7, highStats: 0 },
    gifts: { gifts: 1, prodigy: false, flaws: 1 },
    talent: { scale: 0.88, prodigy: 0, hole: 0.05 },
    modifiers: { soloEfficiencyFloor: everyStat(BELOW_AVERAGE_FLOOR) },
    fateWeight: 0.2,
  },
  middle: {
    label: 'Middle of the class',
    note: 'Good at one thing, fine at most, poor at one. Like nearly everyone.',
    development: { points: 10, highStats: 0 },
    gifts: { gifts: 1, prodigy: false, flaws: 1 },
    talent: { scale: 1, prodigy: 0, hole: 0 },
    modifiers: {},
    fateWeight: 0.4,
  },
  top: {
    label: 'Top of the class',
    note: 'The one the instructors point to. No weak subject worth the name.',
    development: { points: 14, highStats: 1 },
    gifts: { gifts: 2, prodigy: false, flaws: 1 },
    talent: { scale: 1.12, prodigy: 0.05, hole: 0 },
    modifiers: {},
    fateWeight: 0.2,
  },
  genius: {
    label: 'Genius of the year',
    note: 'Talked about in the staff room. Expected to make chūnin in a season.',
    development: { points: 20, highStats: 3 },
    gifts: { gifts: 2, prodigy: true, flaws: 2 },
    talent: { scale: 1.25, prodigy: 0.1, hole: 0 },
    modifiers: {},
    fateWeight: 0.1,
  },
};

/** Characters made before standings existed stood here. */
export const DEFAULT_STANDING: ClassStanding = 'middle';

/** The standing fate deals for a new game's seed: what your file turns out to say. */
export function fateStanding(seed: number): ClassStanding {
  return standingFromRoll(hashUnit(seed, 'class-standing'));
}

/** The standing a roll in [0, 1) lands on, weighted as fate deals them. */
export function standingFromRoll(roll: number): ClassStanding {
  let left = roll;
  for (const standing of CLASS_STANDINGS) {
    left -= STANDING_INFO[standing].fateWeight;
    if (left < 0) return standing;
  }
  return DEFAULT_STANDING;
}
