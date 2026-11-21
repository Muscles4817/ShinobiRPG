import type { LocationDef, PersonDef, PlaceDef } from '../../../types';
import { CANON_KITS } from './kits';
import { CANON_SHELVED, CANON_TEACHES, KIT_KEPT } from './sources';

/**
 * Laying the fighters' canon kits over the pack as written (`kits.ts`): each fighter's arsenal
 * gains what the kit adds (someone without one keeps the kit they fought with and gains the rest),
 * each teacher teaches what they now hold that nothing else teaches, and the rest is shelved in
 * the home village by rank. Pure, so a release build drops it with the fan pack.
 */

function joined(first: readonly string[], more: readonly string[]): string[] {
  return [...first, ...more.filter((id) => !first.includes(id))];
}

/*#__NO_SIDE_EFFECTS__*/
function withKit(person: PersonDef): PersonDef {
  const adds = CANON_KITS[person.id];
  const teaches = CANON_TEACHES[person.id];
  if (!adds && !teaches) return person;
  const held = person.arsenal?.techniqueIds ?? KIT_KEPT[person.id] ?? [];
  const arsenal = adds ? { ...person.arsenal, techniqueIds: joined(held, adds) } : person.arsenal;
  const teacher =
    teaches && person.teacher
      ? { ...person.teacher, teaches: joined(person.teacher.teaches, teaches) }
      : person.teacher;
  return {
    ...person,
    ...(arsenal ? { arsenal } : {}),
    ...(teacher ? { teacher } : {}),
  };
}

/** The people (or versus fighters) with their canon kits laid over them. */
/*#__NO_SIDE_EFFECTS__*/
export function withCanonKits(people: readonly PersonDef[]): PersonDef[] {
  return people.map(withKit);
}

/*#__NO_SIDE_EFFECTS__*/
function shelved(place: PlaceDef): PlaceDef {
  if (place.kind === 'academy') {
    return { ...place, techniqueIds: joined(place.techniqueIds, CANON_SHELVED.academy) };
  }
  if (place.kind === 'library') {
    return { ...place, techniqueIds: joined(place.techniqueIds, CANON_SHELVED.library) };
  }
  return place;
}

/** The locations with the canon kits' shelved techniques in the home village's academy and library. */
/*#__NO_SIDE_EFFECTS__*/
export function withCanonShelves(locations: readonly LocationDef[], homeId: string): LocationDef[] {
  return locations.map((l) => (l.id === homeId ? { ...l, places: l.places.map(shelved) } : l));
}
