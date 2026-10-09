/** A rolling log of what happened, shown to the player as their journal. */
export type JournalTone = 'info' | 'success' | 'warning' | 'danger';

export interface JournalEntry {
  readonly id: number;
  readonly day: number;
  readonly text: string;
  readonly tone: JournalTone;
}

export interface Journal {
  readonly entries: readonly JournalEntry[];
  readonly nextId: number;
}

export const JOURNAL_LIMIT = 200;
export const EMPTY_JOURNAL: Journal = { entries: [], nextId: 1 };

/** Appends an entry, dropping the oldest once the journal is full. */
export function write(
  journal: Journal,
  day: number,
  text: string,
  tone: JournalTone = 'info',
): Journal {
  const entry: JournalEntry = { id: journal.nextId, day, text, tone };
  return {
    entries: [...journal.entries, entry].slice(-JOURNAL_LIMIT),
    nextId: journal.nextId + 1,
  };
}
