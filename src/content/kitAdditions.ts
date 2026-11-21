import type { LocationDef, PersonDef, PlaceDef } from './types';

/**
 * Laying techniques over a pack's people as written: a kit of additions per person id (each
 * fighter's arsenal gains them; someone without one keeps the kit they fought with, `kept`, and
 * gains the rest), what each teacher now teaches, and techniques shelved on the home village's
 * academy rack and library. A pack keeps its additions as reviewable lists (the fan pack's canon
 * kits, a pack's filled kits) and lays them over with these. Pure, so a release build drops a
 * fan pack's with the pack.
 */

export interface KitAdditions {
  /** Technique ids each person gains, after what they fight with now. */
  readonly adds: Readonly<Record<string, readonly string[]>>;
  /** What someone without an arsenal fought with, kept beside the additions. */
  readonly kept?: Readonly<Record<string, readonly string[]>>;
  /** Technique ids each teacher now teaches. */
  readonly teaches?: Readonly<Record<string, readonly string[]>>;
}

export interface ShelfAdditions {
  readonly academy: readonly string[];
  readonly library: readonly string[];
}

function joined(first: readonly string[], more: readonly string[]): string[] {
  return [...first, ...more.filter((id) => !first.includes(id))];
}

/*#__NO_SIDE_EFFECTS__*/
function withKit(person: PersonDef, kit: KitAdditions): PersonDef {
  const adds = kit.adds[person.id];
  const teaches = kit.teaches?.[person.id];
  if (!adds && !teaches) return person;
  const held = person.arsenal?.techniqueIds ?? kit.kept?.[person.id] ?? [];
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

/** The people with each kit laid over them in turn. */
/*#__NO_SIDE_EFFECTS__*/
export function withKitAdditions(
  people: readonly PersonDef[],
  kits: readonly KitAdditions[],
): PersonDef[] {
  return people.map((p) => kits.reduce(withKit, p));
}

/*#__NO_SIDE_EFFECTS__*/
function shelved(place: PlaceDef, adds: ShelfAdditions): PlaceDef {
  if (place.kind === 'academy') {
    return { ...place, techniqueIds: joined(place.techniqueIds, adds.academy) };
  }
  if (place.kind === 'library') {
    return { ...place, techniqueIds: joined(place.techniqueIds, adds.library) };
  }
  return place;
}

/** The locations with techniques added to the home village's academy rack and library. */
/*#__NO_SIDE_EFFECTS__*/
export function withShelfAdditions(
  locations: readonly LocationDef[],
  homeId: string,
  adds: ShelfAdditions,
): LocationDef[] {
  return locations.map((l) =>
    l.id === homeId ? { ...l, places: l.places.map((p) => shelved(p, adds)) } : l,
  );
}
