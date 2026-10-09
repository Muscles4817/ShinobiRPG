/**
 * A rolling record of what happened, shown to the player as their Record and as the
 * ticker on the village screen. Story text carries no numbers; numbers go in chips.
 */
export type JournalTone = 'info' | 'success' | 'warning' | 'danger';
export type ChipTone = 'gain' | 'cost' | 'harm' | 'info';

export interface JournalChip {
  readonly label: string;
  readonly tone: ChipTone;
}

export interface JournalEntry {
  readonly id: number;
  readonly day: number;
  /** Time slot index the entry was written in. */
  readonly slot: number;
  /** What the player did ("Rooftop Sprints"), shown as their own line. */
  readonly heading?: string;
  /** Story text. */
  readonly text: string;
  readonly tone: JournalTone;
  readonly chips?: readonly JournalChip[];
}

export interface Journal {
  readonly entries: readonly JournalEntry[];
  readonly nextId: number;
}

export type NewEntry = Omit<JournalEntry, 'id' | 'day' | 'slot'>;

export const JOURNAL_LIMIT = 200;
export const EMPTY_JOURNAL: Journal = { entries: [], nextId: 1 };

/** Appends an entry, dropping the oldest once the journal is full. */
export function write(
  journal: Journal,
  when: { day: number; slot: number },
  entry: NewEntry,
): Journal {
  const full: JournalEntry = { ...entry, id: journal.nextId, day: when.day, slot: when.slot };
  return {
    entries: [...journal.entries, full].slice(-JOURNAL_LIMIT),
    nextId: journal.nextId + 1,
  };
}
