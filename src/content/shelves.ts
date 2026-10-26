import type { LocationDef, PlaceDef } from './types';

/** A place techniques are learned from: an academy or a library. */
export type ShelfPlace = Extract<PlaceDef, { techniqueIds: readonly string[] }>;

/** Every academy and library in these locations. */
export function shelves(locations: readonly LocationDef[]): ShelfPlace[] {
  return locations.flatMap((l) =>
    l.places.flatMap((p) => (p.kind === 'academy' || p.kind === 'library' ? [p] : [])),
  );
}
