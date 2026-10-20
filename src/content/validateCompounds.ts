import type { CompoundFields, QuarterFields } from './compounds';
import type { ContentPack, PlaceDef } from './types';

/**
 * Clan compounds (`docs/design/compounds-plan.md`): each names a real clan, one compound a clan,
 * a head who belongs to it, and a clan with a compound says how it treats outsiders. A clan
 * belongs to a real village (the start village unless it names one), and its compound stands
 * there. A quarter lists compounds of its own location, each in one quarter at most.
 */

type Compound = PlaceDef & CompoundFields;
type Quarter = PlaceDef & QuarterFields;

function compoundProblems(pack: ContentPack, compound: Compound, locationId: string): string[] {
  const at = `compound "${compound.id}"`;
  const clan = pack.clans.find((c) => c.id === compound.clanId);
  if (!clan) return [`${at} belongs to unknown clan "${compound.clanId}"`];
  const head = compound.headId && pack.people.find((p) => p.id === compound.headId);
  const village = clan.village ?? pack.startLocationId;
  return [
    ...(village === locationId ? [] : [`${at} stands outside the ${clan.id} clan's village`]),
    ...(clan.outsiders ? [] : [`clan "${clan.id}" has a compound but no stance on outsiders`]),
    ...(compound.headId && !head ? [`${at} has unknown head "${compound.headId}"`] : []),
    ...(head && head.clanId !== clan.id
      ? [`${at} is headed by "${head.id}", not of the clan`]
      : []),
  ];
}

/** A clan's village is a real location, and the clanless belong to no village but yours. */
function villageProblems(pack: ContentPack): string[] {
  return pack.clans.flatMap((c) => {
    if (c.village === undefined) return [];
    if (c.id === 'none') return ['the "none" clan can’t belong to another village'];
    return pack.locations.some((l) => l.id === c.village)
      ? []
      : [`clan "${c.id}" belongs to unknown village "${c.village}"`];
  });
}

function quarterProblems(quarter: Quarter, here: readonly PlaceDef[]): string[] {
  return quarter.compoundIds.flatMap((id) =>
    here.some((p) => p.id === id && p.kind === 'compound')
      ? []
      : [`quarter "${quarter.id}" lists "${id}", not a compound of its location`],
  );
}

export function validateCompounds(pack: ContentPack): string[] {
  const places = pack.locations.flatMap((l) => l.places.map((place) => ({ l, place })));
  const placed = places.flatMap(({ l, place }) =>
    place.kind === 'compound' ? [{ compound: place, locationId: l.id }] : [],
  );
  const compounds = placed.map((p) => p.compound);
  const quartered = places.flatMap(({ place }) =>
    place.kind === 'quarter' ? place.compoundIds : [],
  );
  const twice = (list: readonly string[]) => [
    ...new Set(list.filter((x, i) => list.indexOf(x) !== i)),
  ];
  return [
    ...villageProblems(pack),
    ...placed.flatMap((p) => compoundProblems(pack, p.compound, p.locationId)),
    ...twice(compounds.map((c) => c.clanId)).map((id) => `clan "${id}" has more than one compound`),
    ...twice(quartered).map((id) => `compound "${id}" is in more than one quarter`),
    ...places.flatMap(({ l, place }) =>
      place.kind === 'quarter' ? quarterProblems(place, l.places) : [],
    ),
  ];
}
