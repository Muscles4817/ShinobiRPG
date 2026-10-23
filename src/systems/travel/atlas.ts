/**
 * The map as you know it (`docs/design/journeys-plan.md` 3.4): the places you've heard of and the
 * places you've stood in. Places everyone knows (a famous city, the hidden villages) need no
 * entry; the game reads those from content and only what you've learned for yourself is kept.
 */
export interface Atlas {
  /** Places you've heard of, beyond the famous ones. */
  readonly known: readonly string[];
  /** Places you've been to, beyond your home village. */
  readonly visited: readonly string[];
}

export const NEW_ATLAS: Atlas = { known: [], visited: [] };

function withAll(ids: readonly string[], more: readonly string[]): readonly string[] {
  const fresh = more.filter((id, i) => !ids.includes(id) && more.indexOf(id) === i);
  return fresh.length === 0 ? ids : [...ids, ...fresh];
}

/** Places heard of. */
export function learnOf(atlas: Atlas, ids: readonly string[]): Atlas {
  const known = withAll(atlas.known, ids);
  return known === atlas.known ? atlas : { ...atlas, known };
}

/** A place stood in, and so known. */
export function visit(atlas: Atlas, id: string): Atlas {
  const visited = withAll(atlas.visited, [id]);
  const learned = learnOf(atlas, [id]);
  return visited === atlas.visited ? learned : { ...learned, visited };
}
