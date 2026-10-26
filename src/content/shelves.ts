import type { ContentPack, PlaceDef } from './types';

/** A place techniques are learned from: an academy or a library. */
export type ShelfPlace = Extract<PlaceDef, { techniqueIds: readonly string[] }>;

/** Every academy and library in the pack. */
export function shelves(pack: ContentPack): ShelfPlace[] {
  return pack.locations.flatMap((l) =>
    l.places.flatMap((p) => (p.kind === 'academy' || p.kind === 'library' ? [p] : [])),
  );
}
