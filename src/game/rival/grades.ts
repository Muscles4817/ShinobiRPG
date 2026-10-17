import { statTier, STAT_GRADES, STAT_IDS, type Stats } from '@/systems/stats';

import type { Rival } from './state';

/**
 * The race to each grade: whoever of you two reaches a stat's next grade first gets it in the
 * tally. Grades either of you had when the rivalry began don't count.
 */

const gradeOf = (value: number) => STAT_GRADES.indexOf(statTier(value).grade);

/** Each stat's best grade between you, as a starting line: `stat` → grade index. */
export function gradeMarks(yours: Stats, theirs: Stats): Record<string, number> {
  return Object.fromEntries(
    STAT_IDS.map((id) => [id, Math.max(gradeOf(yours[id]), gradeOf(theirs[id]))]),
  );
}

/** A grade newly reached first: which stat, which grade, and by whom. */
export interface GradeFirst {
  readonly key: string;
  readonly stat: (typeof STAT_IDS)[number];
  readonly grade: (typeof STAT_GRADES)[number];
  readonly who: 'you' | 'them';
}

/** Grades past the starting line that one of you reached and the other hasn't, not yet scored. */
export function newFirsts(rival: Rival, yours: Stats, theirs: Stats): GradeFirst[] {
  return STAT_IDS.flatMap((stat) => {
    const start = rival.startGrades[stat] ?? 0;
    const mine = gradeOf(yours[stat]);
    const their = gradeOf(theirs[stat]);
    const top = Math.max(mine, their);
    const found: GradeFirst[] = [];
    for (let g = start + 1; g <= top; g++) {
      const key = `${stat}:${g}`;
      if (rival.firsts[key]) continue;
      const grade = STAT_GRADES[g];
      if (!grade) continue;
      // Both there by now: you were the one who saw it happen first.
      found.push({ key, stat, grade, who: mine >= g ? 'you' : 'them' });
    }
    return found;
  });
}
