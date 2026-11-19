import { STAT_GRADES, statTier, type StatGrade } from '@/systems/stats';

/**
 * How far a technique sits from the learner, and how fast it is studied. A technique's rank
 * uses the same letters as ability grades. Anyone may learn anything; the rank sets the time
 * (`docs/design/combat-ai-plan.md` Part 13c). Against your grade in its discipline: at or below
 * it learns normally; above it is studied more slowly the further it sits (`UNSTABLE_STUDY` for
 * each rank of the gap) and arrives unstable until your grade catches up. Only real
 * prerequisites lock a technique (a clan, a nature, control, reserves: `learnBlocker`).
 */

export type Learnability = 'normal' | 'unstable';

/** Each rank a technique sits above you slows its study by this much again. */
export const UNSTABLE_STUDY = 0.5;

/**
 * Where study happens. A teacher beats the library's annotated copies, which beat a bare
 * scroll (the academy's, or one of your own).
 */
export const STUDY_SOURCES = ['scroll', 'library', 'teacher'] as const;
export type StudySource = (typeof STUDY_SOURCES)[number];
export const SOURCE_QUALITY: Readonly<Record<StudySource, number>> = {
  scroll: 1,
  library: 1.1,
  teacher: 1.5,
};

/**
 * Chakra control's pull on studying a chakra art: steady control learns faster. 1 at about
 * the grade C line, from a floor at nothing to a ceiling well into the jōnin grades.
 */
const CONTROL_STUDY_BASE = 0.75;
const CONTROL_STUDY_PER_POINT = 0.02;
const CONTROL_STUDY_MAX = 1.5;

export function gradeIndex(grade: StatGrade): number {
  return STAT_GRADES.indexOf(grade);
}

/** The grade a stat value sits in. */
export function gradeOf(value: number): StatGrade {
  return statTier(value).grade;
}

/** How many ranks a technique sits above a grade (0 at or below it). */
export function rankGap(rank: StatGrade, grade: StatGrade): number {
  return Math.max(0, gradeIndex(rank) - gradeIndex(grade));
}

export function learnability(rank: StatGrade, grade: StatGrade): Learnability {
  return rankGap(rank, grade) === 0 ? 'normal' : 'unstable';
}

/** The pace a technique is studied at, this many ranks above the learner: half for each. */
export function studyPace(gap: number): number {
  return UNSTABLE_STUDY ** gap;
}

/** Chakra control's multiplier on studying a chakra art. */
export function controlStudyFactor(chakraControl: number): number {
  const factor = CONTROL_STUDY_BASE + chakraControl * CONTROL_STUDY_PER_POINT;
  return Math.min(CONTROL_STUDY_MAX, factor);
}
