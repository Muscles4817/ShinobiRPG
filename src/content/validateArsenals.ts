import type { ContentPack, PersonDef } from './types';
import { carriedProblems } from './validateCarried';

/**
 * People's own arsenals (`PersonDef.arsenal`): every technique is real and clan techniques stay
 * in the clan; gear is real, a piece per slot, tools are real and carried by the piece, and
 * weapon mastery runs 0 to 1; summons are real, and a technique that needs summons out (Sage
 * Mode needs the sage toads) comes with them. An
 * arsenal may list techniques beyond its owner's grades today: the game lets them use each one
 * only once they've grown into it (`game/people/capable.ts`).
 */
export function validateArsenals(pack: ContentPack): string[] {
  return pack.people.flatMap((person) => [
    ...arsenalProblems(pack, person),
    ...kitProblems(pack, person),
  ]);
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

/** The gear and tools an arsenal names, how well its owner knows each weapon, and its summons. */
function kitProblems(pack: ContentPack, person: PersonDef): string[] {
  return [
    ...carriedProblems(pack, `person "${person.id}"`, person.arsenal),
    ...summonProblems(pack, person),
  ];
}

/** The summons an arsenal calls are real, and every summon its techniques need is among them. */
function summonProblems(pack: ContentPack, person: PersonDef): string[] {
  const who = `person "${person.id}"`;
  const summons = person.arsenal?.summons ?? [];
  const known = new Set(pack.contracts.flatMap((c) => c.summons.map((s) => s.id)));
  const ids = person.arsenal?.techniqueIds ?? [];
  const needed = pack.techniques
    .filter((t) => ids.includes(t.id))
    .flatMap((t) => (t.needsCalls ?? []).map((call) => ({ technique: t.id, call })));
  return [
    ...summons.filter((id) => !known.has(id)).map((id) => `${who} calls unknown summon "${id}"`),
    ...needed
      .filter(({ call }) => !summons.includes(call))
      .map(({ technique, call }) => `${who} fights with "${technique}" but can't call "${call}"`),
  ];
}
