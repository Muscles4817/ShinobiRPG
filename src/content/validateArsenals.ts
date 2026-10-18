import { gearSlot } from './items';
import type { ContentPack, PersonDef } from './types';

/**
 * People's own arsenals (`PersonDef.arsenal`): every technique is real and clan techniques stay
 * in the clan; gear is real, a piece per slot, and tools are real and carried by the piece. An
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

/** The gear and tools an arsenal names. */
function kitProblems(pack: ContentPack, person: PersonDef): string[] {
  const who = `person "${person.id}"`;
  const gear = (person.arsenal?.gearIds ?? []).map((id) => ({
    id,
    def: pack.gear.find((g) => g.id === id),
  }));
  const slots = gear.flatMap(({ def }) => (def ? [gearSlot(def)] : []));
  const tools = Object.entries(person.arsenal?.tools ?? {});
  return [
    ...gear.flatMap(({ id, def }) => (def ? [] : [`${who} wears unknown gear "${id}"`])),
    ...slots
      .filter((slot, i) => slots.indexOf(slot) !== i)
      .map((slot) => `${who} wears two pieces in the ${slot} slot`),
    ...tools.flatMap(([id, count]) => [
      ...(pack.tools.some((t) => t.id === id) ? [] : [`${who} carries unknown tool "${id}"`]),
      ...(Number.isInteger(count) && count > 0 ? [] : [`${who} carries ${count} of "${id}"`]),
    ]),
  ];
}
