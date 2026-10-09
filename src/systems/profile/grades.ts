import type { ModifierSpec } from '@/systems/modifiers';
import type { StatDelta } from '@/systems/stats';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';

/**
 * Academy grades per discipline. A grade sets a starting bonus and how quickly that
 * discipline grows and is learned. Grades come from either a quick pick (specialty,
 * strength, weakness) or a point buy against a budget; both produce the same Grades.
 */
export const GRADES = ['A', 'B', 'C', 'D'] as const;
export type Grade = (typeof GRADES)[number];
export type Grades = Readonly<Record<Discipline, Grade>>;

interface GradeInfo {
  readonly label: string;
  readonly statBonus: number;
  /** Growth and study multiplier for the discipline. */
  readonly pace: number;
  /** Point-buy cost (negative refunds points). */
  readonly cost: number;
}

export const GRADE_INFO: Readonly<Record<Grade, GradeInfo>> = {
  A: { label: 'Outstanding', statBonus: 3, pace: 1.25, cost: 3 },
  B: { label: 'Good', statBonus: 1.5, pace: 1.1, cost: 1 },
  C: { label: 'Passing', statBonus: 0, pace: 1, cost: 0 },
  D: { label: 'Poor', statBonus: -1, pace: 0.85, cost: -1 },
};

/** Point-buy budget; equal to a quick pick's specialty + strength + weakness. */
export const POINT_BUDGET = 3;

export const ALL_PASSING: Grades = Object.fromEntries(DISCIPLINES.map((d) => [d, 'C'])) as Record<
  Discipline,
  Grade
>;

export interface QuickPick {
  readonly specialty: Discipline;
  readonly strength: Discipline;
  readonly weakness: Discipline;
}

export function gradesFromQuickPick(pick: QuickPick): Grades {
  return { ...ALL_PASSING, [pick.weakness]: 'D', [pick.strength]: 'B', [pick.specialty]: 'A' };
}

export function pointsSpent(grades: Grades): number {
  return DISCIPLINES.reduce((sum, d) => sum + GRADE_INFO[grades[d]].cost, 0);
}

/** Why a set of grades isn't allowed, or null. */
export function gradesProblem(grades: Grades): string | null {
  const spent = pointsSpent(grades);
  if (spent > POINT_BUDGET) return `That costs ${spent} points; you have ${POINT_BUDGET}.`;
  return null;
}

export function gradeStatBonuses(grades: Grades): StatDelta {
  return Object.fromEntries(DISCIPLINES.map((d) => [d, GRADE_INFO[grades[d]].statBonus]));
}

export function gradeModifiers(grades: Grades): ModifierSpec {
  const pace = Object.fromEntries(DISCIPLINES.map((d) => [d, GRADE_INFO[grades[d]].pace]));
  return { growth: pace, studyDiscipline: pace };
}

/** Disciplines graded A, in discipline order: these earn a starting technique. */
export function topDisciplines(grades: Grades): Discipline[] {
  return DISCIPLINES.filter((d) => grades[d] === 'A');
}
