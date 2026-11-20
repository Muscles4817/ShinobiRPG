import type { ContentPack, LocationDef, PlaceDef } from '@/content';
import type { StatGrade } from '@/systems/stats';
import type { TechniqueDef } from '@/systems/techniques';

/**
 * Where a made technique is taught, when its maker asks for it: in the home village, on the
 * shelf its rank belongs on, as the pack's own are (the academy's rack holds E–D, the library
 * C–A). The library's rules by rank (a sensei's permit, the restricted stacks, the sealed archive)
 * then apply to it as to any scroll there. An S technique is never shelved.
 */

export type TaughtShelf = 'academy' | 'library';

const SHELF_BY_RANK: Readonly<Record<StatGrade, TaughtShelf | null>> = {
  E: 'academy',
  D: 'academy',
  C: 'library',
  B: 'library',
  A: 'library',
  S: null,
};

/** Where a technique of this rank would be taught in the village, or null for one never shelved. */
export function shelfForRank(rank: StatGrade): TaughtShelf | null {
  return SHELF_BY_RANK[rank];
}

/** Who may take it down, in words, once it is shelved. */
const SHELF_WORDS: Readonly<Record<StatGrade, string>> = {
  E: 'On the academy’s rack, for anyone',
  D: 'On the academy’s rack, for anyone',
  C: 'On the library’s open shelves, for genin once their sensei signs the permit',
  B: 'In the library’s restricted stacks, for chūnin and up',
  A: 'In the library’s sealed archive, for jōnin',
  S: 'Never shelved: S techniques are taught by no one',
};

export function shelfWords(rank: StatGrade): string {
  return SHELF_WORDS[rank];
}

function shelved(place: PlaceDef, adds: readonly TechniqueDef[]): PlaceDef {
  if (place.kind !== 'academy' && place.kind !== 'library') return place;
  const ids = adds.filter((t) => shelfForRank(t.rank) === place.kind).map((t) => t.id);
  return ids.length > 0 ? { ...place, techniqueIds: [...place.techniqueIds, ...ids] } : place;
}

/** The pack with these made techniques on its home village's academy rack and library shelves. */
export function withTaught(pack: ContentPack, taught: readonly TechniqueDef[]): ContentPack {
  if (taught.length === 0) return pack;
  const home = (l: LocationDef): LocationDef =>
    l.id === pack.startLocationId ? { ...l, places: l.places.map((p) => shelved(p, taught)) } : l;
  return { ...pack, locations: pack.locations.map(home) };
}
