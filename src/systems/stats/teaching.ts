import { soloEfficiency, type SoloFloor } from './solo';
import { STAT_GRADES, statTier } from './tiers';

/**
 * Learning from someone else: a sparring partner, a foe, later a teacher. What it is worth
 * depends on the grade gap in the stat between them and you. An equal is a little better than
 * practising alone; one grade up is good and two is very good, whatever your own grade, which is
 * how the wall solo practice hits at C is climbed; three or more is no better than two. Someone
 * below you teaches almost nothing. Fights and "train with" share this one rule.
 */

/** How far ahead of you a teacher is counted: three grades up teach no more than two. */
export const MAX_TEACHER_GAP = 2;

/** Teacher grade gap (theirs minus yours, capped) → multiplier on your own solo efficiency. */
export const TEACHER_GAP_SCALE: Readonly<Record<number, number>> = { 0: 1.25, 1: 1.6, 2: 2 };

/**
 * Teacher grade gap → the least a session is worth, however poorly solo practice does at your
 * grade: the reason a better teacher is worth seeking out once training alone has stalled.
 */
export const TEACHER_GAP_FLOOR: Readonly<Record<number, number>> = { 0: 0, 1: 0.35, 2: 0.6 };

/** Someone weaker than you in the stat: a sliver of a solo session. */
export const WEAKER_TEACHER_SCALE = 0.1;

function gradeIndex(value: number): number {
  return STAT_GRADES.indexOf(statTier(value).grade);
}

/** Grades the teacher stands above you in a stat (negative when below), capped at the top. */
export function teacherGap(yours: number, theirs: number): number {
  return Math.min(MAX_TEACHER_GAP, gradeIndex(theirs) - gradeIndex(yours));
}

/**
 * Share of a session's gain a session with this teacher keeps, for a stat now at `yours`,
 * against the teacher's value `theirs` in it (in place of `soloEfficiency`).
 */
export function teacherEfficiency(
  yours: number,
  theirs: number,
  floors: readonly SoloFloor[] = [],
): number {
  const solo = soloEfficiency(yours, floors);
  const gap = teacherGap(yours, theirs);
  if (gap < 0) return solo * WEAKER_TEACHER_SCALE;
  return Math.max(solo * (TEACHER_GAP_SCALE[gap] ?? 1), TEACHER_GAP_FLOOR[gap] ?? 0);
}
