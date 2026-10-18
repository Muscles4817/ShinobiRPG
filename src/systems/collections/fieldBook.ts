/**
 * The field book: what you have caught, gathered, followed and fought, kept as plain counts so
 * the pages can be read back from it. Recording never fails and never forgets; a page's reward
 * is handed over once (`rewarded`).
 */

export interface Catch {
  readonly count: number;
  /** The longest one landed, in centimetres, and the day it was landed. */
  readonly best: number;
  readonly bestDay: number;
}

export interface FoeRecord {
  readonly fought: number;
  readonly beaten: number;
}

export interface FieldBook {
  /** Fish (and anything else that takes a line) by ingredient id. */
  readonly catches: Readonly<Record<string, Catch>>;
  /** Wild finds gathered by hand, by ingredient id. */
  readonly finds: Readonly<Record<string, number>>;
  /** Night sights followed, in the order you followed them. */
  readonly sights: readonly string[];
  readonly foes: Readonly<Record<string, FoeRecord>>;
  /** Pages whose reward has been handed over. */
  readonly rewarded: readonly string[];
}

export const EMPTY_FIELD_BOOK: FieldBook = {
  catches: {},
  finds: {},
  sights: [],
  foes: {},
  rewarded: [],
};

/** Beaten this many times, a foe is known well: everything about it is written in. */
export const FOE_KNOWN_AT = 3;

export interface Landed {
  readonly id: string;
  readonly length: number;
  readonly day: number;
}

/** Writes in a catch; `best` says whether it beat the longest one before it. */
export function recordCatch(
  book: FieldBook,
  landed: Landed,
): { readonly book: FieldBook; readonly best: boolean } {
  const before = book.catches[landed.id];
  const best = before === undefined || landed.length > before.best;
  const entry: Catch = best
    ? { count: (before?.count ?? 0) + 1, best: landed.length, bestDay: landed.day }
    : { ...before, count: before.count + 1 };
  return { book: { ...book, catches: { ...book.catches, [landed.id]: entry } }, best };
}

export function recordFinds(book: FieldBook, ids: readonly string[]): FieldBook {
  if (ids.length === 0) return book;
  const finds = { ...book.finds };
  for (const id of ids) finds[id] = (finds[id] ?? 0) + 1;
  return { ...book, finds };
}

export function recordSight(book: FieldBook, sightId: string): FieldBook {
  return book.sights.includes(sightId) ? book : { ...book, sights: [...book.sights, sightId] };
}

/** Writes in a fight against these foes (one line for each kind, however many came). */
export function recordFight(book: FieldBook, foeIds: readonly string[], won: boolean): FieldBook {
  if (foeIds.length === 0) return book;
  const foes = { ...book.foes };
  for (const id of new Set(foeIds)) {
    const before = foes[id] ?? { fought: 0, beaten: 0 };
    foes[id] = { fought: before.fought + 1, beaten: before.beaten + (won ? 1 : 0) };
  }
  return { ...book, foes };
}

export function knownWell(record: FoeRecord | undefined): boolean {
  return (record?.beaten ?? 0) >= FOE_KNOWN_AT;
}

export function markRewarded(book: FieldBook, page: string): FieldBook {
  return book.rewarded.includes(page) ? book : { ...book, rewarded: [...book.rewarded, page] };
}

/** How long a fish is, from where it falls in its kind's range (0–1): big ones are rare. */
export function lengthAt(range: readonly [number, number], unit: number): number {
  const [shortest, longest] = range;
  return Math.round(shortest + (longest - shortest) * unit * unit);
}
