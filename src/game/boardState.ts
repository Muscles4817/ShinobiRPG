/** The jobs board's saved shape; the rules that fill it live in `board.ts`. */

export interface Posting {
  readonly missionId: string;
  readonly postedDay: number;
  /** Last day the job stays up. */
  readonly expiresDay: number;
}

export interface Board {
  readonly seed: number;
  /** The day postings were last brought up to date. */
  readonly refreshedDay: number;
  readonly postings: readonly Posting[];
  /** Standing jobs: the day each was last taken. */
  readonly lastTaken: Readonly<Record<string, number>>;
  /** Jobs you've paid the clerk to tell you about: you know who you'll face. */
  readonly intel: readonly string[];
  /** Jobs you have finished at least once (a teacher may ask for one). */
  readonly completed: readonly string[];
  /**
   * The new jobs decided for the day after the board was last brought up to date: the gossip
   * tells of them, and they go up that day whatever happens before (null before any is decided).
   */
  readonly upcoming: { readonly day: number; readonly missionIds: readonly string[] } | null;
}

export function newBoard(seed: number): Board {
  return {
    seed,
    refreshedDay: 0,
    postings: [],
    lastTaken: {},
    intel: [],
    completed: [],
    upcoming: null,
  };
}
