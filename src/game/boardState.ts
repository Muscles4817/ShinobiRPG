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
}

export function newBoard(seed: number): Board {
  return { seed, refreshedDay: 0, postings: [], lastTaken: {} };
}
