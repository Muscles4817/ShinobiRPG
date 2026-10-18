import type { FieldBook } from '@/systems/collections';

/**
 * The field book's entries as `kind:id` keys, so the day's record can say what is new in it
 * without keeping a copy of the book.
 */

export const ENTRY_KINDS = ['fish', 'find', 'sight', 'foe'] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];

export function fieldBookKeys(book: FieldBook): string[] {
  return [
    ...Object.keys(book.catches).map((id) => `fish:${id}`),
    ...Object.keys(book.finds).map((id) => `find:${id}`),
    ...book.sights.map((id) => `sight:${id}`),
    ...Object.keys(book.foes).map((id) => `foe:${id}`),
  ];
}

/** A key split back into its kind and id, or null for one this version doesn't know. */
export function entryOf(key: string): { readonly kind: EntryKind; readonly id: string } | null {
  const at = key.indexOf(':');
  const kind = ENTRY_KINDS.find((k) => k === key.slice(0, at));
  return kind ? { kind, id: key.slice(at + 1) } : null;
}
