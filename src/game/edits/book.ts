import { STAT_IDS, type StatId } from '@/systems/stats';

import { NO_EDITS, type ContentEdits, type FighterEdit } from './state';

/**
 * The device's edit book: every pack's edits, kept apart from any save (a `SaveStore` of its
 * own) so they outlive a playthrough. Read defensively: whatever doesn't fit the shape is
 * dropped, never trusted.
 */

const BOOK_VERSION = 1;

export interface EditBook {
  readonly packs: Readonly<Record<string, ContentEdits>>;
}

export const EMPTY_BOOK: EditBook = { packs: {} };

type Raw = Record<string, unknown>;

const isRecord = (value: unknown): value is Raw =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStatId = (key: string): key is StatId => (STAT_IDS as readonly string[]).includes(key);

function statsFrom(raw: unknown): Partial<Record<StatId, number>> | null {
  if (!isRecord(raw)) return null;
  const stats: Partial<Record<StatId, number>> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (isStatId(key) && typeof value === 'number' && Number.isFinite(value)) stats[key] = value;
  }
  return Object.keys(stats).length > 0 ? stats : null;
}

function idsFrom(raw: unknown): string[] | null {
  return Array.isArray(raw) && raw.every((id) => typeof id === 'string') ? raw : null;
}

function fighterFrom(raw: unknown): FighterEdit | null {
  if (!isRecord(raw)) return null;
  const stats = statsFrom(raw.stats);
  const techniqueIds = idsFrom(raw.techniqueIds);
  if (!stats && !techniqueIds) return null;
  return { ...(stats ? { stats } : {}), ...(techniqueIds ? { techniqueIds } : {}) };
}

/** A pack's edits read from untrusted data (a book, an old save); nothing usable is none. */
export function editsFrom(raw: unknown): ContentEdits {
  if (!isRecord(raw) || !isRecord(raw.fighters)) return NO_EDITS;
  const fighters = Object.entries(raw.fighters).flatMap(([key, value]) => {
    const edit = fighterFrom(value);
    return edit ? [[key, edit] as const] : [];
  });
  return { fighters: Object.fromEntries(fighters) };
}

/** The book kept in a store; missing or unreadable, an empty one. */
export function readEditBook(raw: string | null): EditBook {
  if (!raw) return EMPTY_BOOK;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return EMPTY_BOOK;
  }
  if (!isRecord(parsed) || parsed.version !== BOOK_VERSION || !isRecord(parsed.packs)) {
    return EMPTY_BOOK;
  }
  const packs = Object.entries(parsed.packs).map(([id, edits]) => [id, editsFrom(edits)] as const);
  return { packs: Object.fromEntries(packs) };
}

export function writeEditBook(book: EditBook): string {
  return JSON.stringify({ version: BOOK_VERSION, packs: book.packs });
}

export function packEdits(book: EditBook, packId: string): ContentEdits {
  return book.packs[packId] ?? NO_EDITS;
}

export function withPackEdits(book: EditBook, packId: string, edits: ContentEdits): EditBook {
  return { packs: { ...book.packs, [packId]: edits } };
}
