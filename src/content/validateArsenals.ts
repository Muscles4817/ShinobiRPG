import type { ContentPack, PersonDef } from './types';

/**
 * People's own arsenals (`PersonDef.arsenal`): every technique is real and clan techniques stay
 * in the clan. An arsenal may list techniques beyond its owner's grades today: the game lets
 * them use each one only once they've grown into it (`game/people/capable.ts`).
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
    return t.clan !== undefined && t.clan !== person.clanId
      ? [`person "${person.id}" fights with "${id}" of clan "${t.clan}"`]
      : [];
  });
}
