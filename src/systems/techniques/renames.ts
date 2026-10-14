import type { TechniqueBook } from './techniques';

/**
 * Moving a technique book over when content merges one technique into another (old id → the
 * id it became). Whatever was known under either id stays known once; study progress keeps the
 * furthest of the two; a merged technique is unstable only when nothing stable became it.
 */

export type TechniqueRenames = Readonly<Record<string, string>>;

function renamed(id: string, renames: TechniqueRenames): string {
  return renames[id] ?? id;
}

function unique(ids: readonly string[]): string[] {
  return [...new Set(ids)];
}

export function renameInBook(book: TechniqueBook, renames: TechniqueRenames): TechniqueBook {
  const known = unique(book.known.map((id) => renamed(id, renames)));
  const stable = new Set(
    book.known.filter((id) => !book.unstable.includes(id)).map((id) => renamed(id, renames)),
  );
  const unstable = unique(book.unstable.map((id) => renamed(id, renames))).filter(
    (id) => known.includes(id) && !stable.has(id),
  );
  const progress: Record<string, number> = {};
  for (const [id, points] of Object.entries(book.progress)) {
    const to = renamed(id, renames);
    if (!known.includes(to)) progress[to] = Math.max(progress[to] ?? 0, points);
  }
  return { known, progress, unstable };
}
