import {
  createStats,
  STAT_IDS,
  type Aptitude,
  type StatGrade,
  type StatId,
  type Stats,
} from '@/systems/stats';

/**
 * Shorthand for authoring a person's stats: a grade (or exact value) for everything, then the
 * stats that differ. A grade stands for a typical value inside its band. Marked side-effect
 * free so a release build can still tree-shake fan packs that call it at module level.
 */

/** A typical value inside each grade's band (`STAT_TIERS`). */
const GRADE_VALUE: Readonly<Record<StatGrade, number>> = {
  E: 5,
  D: 10,
  C: 16,
  B: 23,
  A: 32,
  S: 44,
};

/** A grade, or an exact value where the grade is too coarse. */
export type StatMark = StatGrade | number;

function valueOf(mark: StatMark): number {
  return typeof mark === 'number' ? mark : GRADE_VALUE[mark];
}

/*#__NO_SIDE_EFFECTS__*/
export function statLine(
  base: StatMark,
  marks: Readonly<Partial<Record<StatId, StatMark>>> = {},
): Stats {
  const stats = createStats(valueOf(base));
  const entries = STAT_IDS.map((id) => {
    const mark = marks[id];
    return [id, mark === undefined ? stats[id] : valueOf(mark)] as const;
  });
  return Object.fromEntries(entries) as Record<StatId, number>;
}

/** Shorthand for an authored aptitude: a multiplier for everything, then the exceptions. */
/*#__NO_SIDE_EFFECTS__*/
export function talent(
  base: number,
  marks: Readonly<Partial<Record<StatId, number>>> = {},
): Aptitude {
  const entries = STAT_IDS.map((id) => [id, marks[id] ?? base] as const);
  return Object.fromEntries(entries) as Record<StatId, number>;
}
