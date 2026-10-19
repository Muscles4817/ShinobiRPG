import {
  STAT_GRADES,
  STAT_INFO,
  statTier,
  statTierOf,
  type StatGrade,
  type StatId,
} from '@/systems/stats';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';

import type { DayEnd } from '../daybook/state';

/**
 * The end-of-day sheet's growth rows: each stat that moved, as a bar through its grade and a
 * few words on where it stands ("Over halfway to a C"), biggest gain first.
 */

const MAX_GROWTH_ROWS = 5;

export interface DayGrowth {
  readonly stat: StatId;
  readonly name: string;
  readonly grade: StatGrade;
  /** "Genin D". */
  readonly tier: string;
  /** Through the grade at dawn and now, 0–1: the bar's dim part and today's bright share. */
  readonly from: number;
  readonly to: number;
  /** "Close to Genin D". */
  readonly words: string;
  /** A new grade today. */
  readonly up: boolean;
  /** An art's colour; null for body and mind. */
  readonly discipline: Discipline | null;
}

function disciplineOf(stat: StatId): Discipline | null {
  return DISCIPLINES.find((d) => d === stat) ?? null;
}

/** "a C", "an A": a grade as a school report says it. */
function aGrade(grade: string): string {
  return `${/^[AEFS]/.test(grade) ? 'an' : 'a'} ${grade}`;
}

function growthWords(progress: number, up: boolean, grades: Grades): string {
  if (up) return `A new grade today, ${aGrade(grades.now)}`;
  if (!grades.next) return 'As high as it goes';
  if (progress >= 0.85) return `Nearly ${aGrade(grades.next)}`;
  if (progress >= 0.5) return `Over halfway to ${aGrade(grades.next)}`;
  return progress >= 0.25
    ? `On the way to ${aGrade(grades.next)}`
    : `Only just ${aGrade(grades.now)}`;
}

interface Grades {
  readonly now: StatGrade;
  readonly next: StatGrade | null;
}

export function growthRows(ended: DayEnd): DayGrowth[] {
  const rows = (Object.entries(ended.stats) as [StatId, readonly [number, number]][])
    .filter(([, [before, after]]) => after > before)
    .sort(([, a], [, b]) => b[1] - b[0] - (a[1] - a[0]));
  return rows.slice(0, MAX_GROWTH_ROWS).map(([stat, [before, after]]) => {
    const now = statTierOf(stat, after);
    const up = statTier(before).grade !== now.grade;
    return {
      stat,
      name: STAT_INFO[stat].label,
      grade: now.grade,
      tier: now.label,
      from: up ? 0 : statTier(before).progress,
      to: now.progress,
      words: growthWords(now.progress, up, {
        now: now.grade,
        next: STAT_GRADES[STAT_GRADES.indexOf(now.grade) + 1] ?? null,
      }),
      up,
      discipline: disciplineOf(stat),
    };
  });
}
