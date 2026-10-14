import { STAT_GRADES, statTier } from '@/systems/stats';

import type { ContentPack, PersonDef } from './types';

/**
 * People's own arsenals (`PersonDef.arsenal`): every technique is real, no one fights with a
 * technique above their grade in its art, and clan techniques stay in the clan.
 */
export function validateArsenals(pack: ContentPack): string[] {
  return pack.people.flatMap((person) => arsenalProblems(pack, person));
}

function arsenalProblems(pack: ContentPack, person: PersonDef): string[] {
  const ids = person.arsenal?.techniqueIds ?? [];
  if (person.arsenal && ids.length === 0) return [`person "${person.id}" has an empty arsenal`];
  return ids.flatMap((id) => {
    const t = pack.techniques.find((d) => d.id === id);
    if (!t) return [`person "${person.id}" fights with unknown technique "${id}"`];
    const grade = statTier(person.stats[t.discipline]).grade;
    const problems: string[] = [];
    if (STAT_GRADES.indexOf(t.rank) > STAT_GRADES.indexOf(grade)) {
      problems.push(
        `person "${person.id}" fights with "${id}" of rank ${t.rank}, above their ${t.discipline} grade ${grade}`,
      );
    }
    if (t.clan !== undefined && t.clan !== person.clanId) {
      problems.push(`person "${person.id}" fights with "${id}" of clan "${t.clan}"`);
    }
    return problems;
  });
}
