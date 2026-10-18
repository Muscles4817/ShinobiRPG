import { FIELD_BOOK_PAGES } from './fieldBook';
import type { ContentPack } from './types';

/**
 * The field book can be filled: every fish on a fishing spot can be measured (a `length`,
 * shortest first), and every page's reward is a piece of furniture that exists and is never sold.
 */
export function validateFieldBook(pack: ContentPack): string[] {
  const ingredients = new Map(pack.ingredients.map((i) => [i.id, i]));
  const fishIds = new Set(
    pack.locations.flatMap((l) =>
      l.places.flatMap((p) =>
        p.kind === 'wilds'
          ? (p.spots ?? []).flatMap((s) => s.catches.map((c) => c.ingredientId))
          : [],
      ),
    ),
  );
  const fish = [...fishIds].flatMap((id) => {
    const length = ingredients.get(id)?.length;
    if (!length) return [`fish "${id}" has no length for the field book`];
    return length[0] > 0 && length[0] < length[1] ? [] : [`fish "${id}" has a length out of order`];
  });
  const furnishings = new Map(pack.furnishings.map((f) => [f.id, f]));
  const rewards = FIELD_BOOK_PAGES.flatMap((page) => {
    const id = pack.fieldBook[page].furnishingId;
    if (id === undefined) return [];
    const piece = furnishings.get(id);
    if (!piece) return [`field book page "${page}" rewards unknown furnishing "${id}"`];
    return piece.cost === undefined
      ? []
      : [`field book page "${page}" rewards a piece that is sold`];
  });
  return [...fish, ...rewards];
}
