import { APTITUDE_MAX, STAT_IDS, STAT_MAX } from '@/systems/stats';

import type { PersonDef, PersonRank, PersonRole } from './people';
import type { ContentPack } from './types';

/**
 * Rank and number sanity for the cast: each role holds a fitting rank, and every stat sits on
 * the scale. A grade is never held against a rank: the rank chart is an average for an ordinary
 * shinobi, so anyone may hold any grade in any stat (`docs/design/stat-model-plan.md`).
 */

const ROLE_RANKS: Readonly<Record<PersonRole, readonly PersonRank[]>> = {
  genin: ['genin'],
  sensei: ['jonin'],
  instructor: ['chunin', 'jonin'],
  leader: ['jonin', 'kage'],
  shinobi: ['chunin', 'jonin', 'kage'],
  villager: ['civilian'],
};

function rankProblems(person: PersonDef): string[] {
  return ROLE_RANKS[person.role].includes(person.rank)
    ? []
    : [`person "${person.id}" is a ${person.role} but ranked ${person.rank}`];
}

function numberProblems(person: PersonDef): string[] {
  const stats = STAT_IDS.filter((id) => !(person.stats[id] >= 0 && person.stats[id] <= STAT_MAX));
  const talents = STAT_IDS.filter((id) => {
    const value = person.aptitude?.[id] ?? 1;
    return !(value >= 0 && value <= APTITUDE_MAX);
  });
  return [
    ...stats.map(
      (id) => `person "${person.id}" has ${id} off the scale (0–${STAT_MAX}) or missing`,
    ),
    ...talents.map(
      (id) => `person "${person.id}" has an aptitude outside 0–${APTITUDE_MAX} in ${id}`,
    ),
  ];
}

export function validateRanks(pack: ContentPack): string[] {
  return pack.people.flatMap((p) => [...rankProblems(p), ...numberProblems(p)]);
}
