import { APTITUDE_MAX, STAT_GRADES, statTier, STAT_IDS, type StatGrade } from '@/systems/stats';

import type { PersonDef, PersonRank, PersonRole } from './people';
import type { ContentPack } from './types';

/**
 * Rank and grade sanity for the cast: each role holds a fitting rank, and a person's best
 * stat sits in the grades their rank belongs to (genin E–D, chūnin C–B, jōnin B–A, kage A–S;
 * civilians no better than a genin). A sensei is B or A in what they teach.
 */

interface GradeBand {
  readonly lowest: StatGrade;
  readonly highest: StatGrade;
}

const BEST_STAT_BAND: Readonly<Record<PersonRank, GradeBand>> = {
  civilian: { lowest: 'E', highest: 'D' },
  genin: { lowest: 'E', highest: 'D' },
  chunin: { lowest: 'C', highest: 'B' },
  jonin: { lowest: 'B', highest: 'A' },
  kage: { lowest: 'A', highest: 'S' },
};

const ROLE_RANKS: Readonly<Record<PersonRole, readonly PersonRank[]>> = {
  genin: ['genin'],
  sensei: ['jonin'],
  instructor: ['chunin', 'jonin'],
  leader: ['jonin', 'kage'],
  shinobi: ['chunin', 'jonin', 'kage'],
  villager: ['civilian'],
};

const SENSEI_BAND: GradeBand = { lowest: 'B', highest: 'A' };

function within(grade: StatGrade, band: GradeBand): boolean {
  const at = STAT_GRADES.indexOf(grade);
  return at >= STAT_GRADES.indexOf(band.lowest) && at <= STAT_GRADES.indexOf(band.highest);
}

function gradeOf(value: number): StatGrade {
  return statTier(value).grade;
}

function rankProblems(person: PersonDef): string[] {
  const problems: string[] = [];
  if (!ROLE_RANKS[person.role].includes(person.rank)) {
    problems.push(`person "${person.id}" is a ${person.role} but ranked ${person.rank}`);
  }
  const best = gradeOf(Math.max(...STAT_IDS.map((id) => person.stats[id])));
  const band = BEST_STAT_BAND[person.rank];
  if (!within(best, band)) {
    problems.push(
      `person "${person.id}" (${person.rank}) has a best stat at ${best}, outside ${band.lowest}–${band.highest}`,
    );
  }
  const taught = person.sensei?.specialty;
  if (taught && !within(gradeOf(person.stats[taught]), SENSEI_BAND)) {
    problems.push(`sensei "${person.id}" must be B or A in ${taught}`);
  }
  return problems;
}

function numberProblems(person: PersonDef): string[] {
  const stats = STAT_IDS.filter((id) => !(person.stats[id] >= 0));
  const talents = STAT_IDS.filter((id) => {
    const value = person.aptitude?.[id] ?? 1;
    return !(value >= 0 && value <= APTITUDE_MAX);
  });
  return [
    ...stats.map((id) => `person "${person.id}" has a negative or missing ${id}`),
    ...talents.map(
      (id) => `person "${person.id}" has an aptitude outside 0–${APTITUDE_MAX} in ${id}`,
    ),
  ];
}

export function validateRanks(pack: ContentPack): string[] {
  return pack.people.flatMap((p) => [...rankProblems(p), ...numberProblems(p)]);
}
