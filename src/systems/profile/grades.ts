import { DISCIPLINES, type Discipline } from '@/systems/techniques';

/**
 * Academy grades per discipline. They are not chosen: the report card reads them off the arts
 * a student graduates with (early training, clan and file all count), so an A says the art
 * was already strong, never how fast it will grow (that is talent: gifts and the hidden roll).
 * Senseis still read the card when they pick their students.
 */
export const GRADES = ['A', 'B', 'C', 'D'] as const;
export type Grade = (typeof GRADES)[number];
export type Grades = Readonly<Record<Discipline, Grade>>;

interface GradeInfo {
  readonly label: string;
  /** The starting value an art needs for this grade. */
  readonly from: number;
  /** How much the grade counts with a teacher choosing students (negative puts them off). */
  readonly regard: number;
}

export const GRADE_INFO: Readonly<Record<Grade, GradeInfo>> = {
  A: { label: 'Outstanding', from: 12, regard: 3 },
  B: { label: 'Good', from: 9, regard: 1.5 },
  C: { label: 'Passing', from: 5, regard: 0 },
  D: { label: 'Poor', from: Number.NEGATIVE_INFINITY, regard: -1 },
};

/** The grade the report card gives an art graduating at `value`. */
export function gradeFor(value: number): Grade {
  return GRADES.find((g) => value >= GRADE_INFO[g].from) ?? 'D';
}

/** The report card for a student's starting arts. */
export function gradesFor(arts: Readonly<Record<Discipline, number>>): Grades {
  return Object.fromEntries(DISCIPLINES.map((d) => [d, gradeFor(arts[d])])) as Record<
    Discipline,
    Grade
  >;
}

/**
 * Disciplines that earn a starting technique, in discipline order: those graded A, or with no
 * A, those graded B. A student with neither starts with the academy's techniques alone.
 */
export function topDisciplines(grades: Grades): Discipline[] {
  const graded = (g: Grade) => DISCIPLINES.filter((d) => grades[d] === g);
  const top = graded('A');
  return top.length > 0 ? top : graded('B');
}
