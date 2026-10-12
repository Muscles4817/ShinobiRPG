import { STAT_GRADES, statTier, type StatGrade } from '@/systems/stats';

/**
 * How far a technique sits from the learner, and how fast it is studied. A technique's rank
 * uses the same letters as ability grades. Against your grade in its discipline: at or below
 * it learns normally; one above learns slowly and arrives unstable; two or more above can't
 * be learned at all, teacher or not.
 */

export type Learnability = 'normal' | 'unstable' | 'impossible';

/** A technique one rank above you is studied at this fraction of the usual pace. */
export const UNSTABLE_STUDY = 0.5;

/** Where study happens. A teacher beats a scroll (more sources arrive with libraries). */
export const STUDY_SOURCES = ['scroll', 'teacher'] as const;
export type StudySource = (typeof STUDY_SOURCES)[number];
export const SOURCE_QUALITY: Readonly<Record<StudySource, number>> = { scroll: 1, teacher: 1.5 };

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

/** The lowest grade from which a technique of this rank can be learned at all. */
export function gradeToAttempt(rank: StatGrade): StatGrade {
  return STAT_GRADES[Math.max(0, gradeIndex(rank) - 1)] ?? 'E';
}

export function learnability(rank: StatGrade, grade: StatGrade): Learnability {
  const gap = gradeIndex(rank) - gradeIndex(grade);
  if (gap <= 0) return 'normal';
  return gap === 1 ? 'unstable' : 'impossible';
}

/** Chakra control's multiplier on studying a chakra art. */
export function controlStudyFactor(chakraControl: number): number {
  const factor = CONTROL_STUDY_BASE + chakraControl * CONTROL_STUDY_PER_POINT;
  return Math.min(CONTROL_STUDY_MAX, factor);
}
