import { hashUnit } from '@/core';
import type { ModifierSpec } from '@/systems/modifiers';
import { STAT_IDS, type SoloFloor, type StatId } from '@/systems/stats';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';

import type { Grade, Grades, QuickPick } from './grades';

/**
 * Where a character stood in their academy class: dead last to the genius of the year. It is
 * the one choice at creation that is not a trade-off. It sets what you can do now (the grade
 * budget and the quick pick's grades) and what you could become (the band your hidden talent is
 * rolled in), so it is how hard the game is. The low end gets the hard-work route: training
 * alone keeps paying off further than it does for anyone else.
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
  /** Arts graded A never roll below this (a genius is a genius at something). */
  readonly specialtyAtLeast?: number;
}

/** The quick pick's grades: the specialty, the strength, the weakness and everything else. */
export interface QuickGrades {
  readonly specialty: Grade;
  readonly strength: Grade;
  readonly weakness: Grade;
  readonly rest: Grade;
}

export interface StandingInfo {
  readonly label: string;
  /** How the instructors wrote it on the file. */
  readonly note: string;
  /** Point-buy budget: the most the grades may cost. */
  readonly budget: number;
  readonly quick: QuickGrades;
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
    budget: -3,
    quick: { specialty: 'C', strength: 'C', weakness: 'D', rest: 'D' },
    talent: { scale: 0.75, prodigy: -1, hole: 0.1 },
    modifiers: { soloEfficiencyFloor: everyStat(DEAD_LAST_FLOOR) },
    fateWeight: 0.1,
  },
  'below-average': {
    label: 'Below average',
    note: 'Scraped through. Works hard, mostly to keep up.',
    budget: 0,
    quick: { specialty: 'B', strength: 'C', weakness: 'D', rest: 'C' },
    talent: { scale: 0.88, prodigy: 0, hole: 0.05 },
    modifiers: { soloEfficiencyFloor: everyStat(BELOW_AVERAGE_FLOOR) },
    fateWeight: 0.2,
  },
  middle: {
    label: 'Middle of the class',
    note: 'Good at one thing, fine at most, poor at one. Like nearly everyone.',
    budget: 3,
    quick: { specialty: 'A', strength: 'B', weakness: 'D', rest: 'C' },
    talent: { scale: 1, prodigy: 0, hole: 0 },
    modifiers: {},
    fateWeight: 0.4,
  },
  top: {
    label: 'Top of the class',
    note: 'The one the instructors point to. No weak subject worth the name.',
    budget: 5,
    quick: { specialty: 'A', strength: 'B', weakness: 'C', rest: 'C' },
    talent: { scale: 1.12, prodigy: 0.05, hole: 0 },
    modifiers: {},
    fateWeight: 0.2,
  },
  genius: {
    label: 'Genius of the year',
    note: 'Talked about in the staff room. Expected to make chūnin in a season.',
    budget: 7,
    quick: { specialty: 'A', strength: 'A', weakness: 'C', rest: 'C' },
    talent: { scale: 1.25, prodigy: 0.1, hole: 0, specialtyAtLeast: 1.4 },
    modifiers: {},
    fateWeight: 0.1,
  },
};

/** Characters made before standings existed stood here. */
export const DEFAULT_STANDING: ClassStanding = 'middle';

/** The standing fate deals for a new game's seed: what your file turns out to say. */
export function fateStanding(seed: number): ClassStanding {
  let roll = hashUnit(seed, 'class-standing');
  for (const standing of CLASS_STANDINGS) {
    roll -= STANDING_INFO[standing].fateWeight;
    if (roll < 0) return standing;
  }
  return DEFAULT_STANDING;
}

/** The grades a quick pick gives at this standing. */
export function quickGrades(pick: QuickPick, standing: ClassStanding): Grades {
  const { quick } = STANDING_INFO[standing];
  const graded = DISCIPLINES.map((d): [Discipline, Grade] => {
    if (d === pick.specialty) return [d, quick.specialty];
    if (d === pick.strength) return [d, quick.strength];
    if (d === pick.weakness) return [d, quick.weakness];
    return [d, quick.rest];
  });
  return Object.fromEntries(graded) as Record<Discipline, Grade>;
}

/** The quick pick read back from grades it made: the first art at each role's grade, in turn. */
export function pickFromGrades(grades: Grades, standing: ClassStanding): QuickPick {
  const { quick } = STANDING_INFO[standing];
  const taken: Discipline[] = [];
  const find = (grade: Grade, fallback: Discipline): Discipline => {
    const found =
      DISCIPLINES.find((d) => grades[d] === grade && !taken.includes(d)) ??
      DISCIPLINES.find((d) => !taken.includes(d)) ??
      fallback;
    taken.push(found);
    return found;
  };
  const specialty = find(quick.specialty, 'taijutsu');
  const strength = find(quick.strength, 'ninjutsu');
  const weakness = find(quick.weakness, 'genjutsu');
  return { specialty, strength, weakness };
}

/** The grade a quick pick gives each role, for labelling it. */
export function roleGrade(role: keyof QuickPick, standing: ClassStanding): Grade {
  return STANDING_INFO[standing].quick[role];
}

/** What a standing's grades let you spend, said for the point buy. */
export function budgetOf(standing: ClassStanding): number {
  return STANDING_INFO[standing].budget;
}
