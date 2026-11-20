/**
 * Ids of techniques made in the editor: a prefix of their own, so they never meet a pack's ids,
 * then the name they were first kept under, numbered where that is taken. A made technique
 * keeps its id when renamed, so the fighters given it keep it too.
 */

export const MADE_PREFIX = 'made-';
const SLUG_MAX = 32;

function slugOf(name: string): string {
  const slug = name
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX);
  return slug || 'technique';
}

/** A new made technique's id from its name, clear of every id already taken. */
export function madeIdFor(name: string, taken: (id: string) => boolean): string {
  const base = `${MADE_PREFIX}${slugOf(name)}`;
  if (!taken(base)) return base;
  let n = 2;
  while (taken(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
