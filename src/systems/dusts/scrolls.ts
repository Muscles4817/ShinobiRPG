/**
 * An S-rank scroll that teaches command of a kind of dust (`docs/design/retinue-plan.md` step
 * 4e): kept until it is read through, a day's study at a time. Mastered, it gives its reader a
 * store of the kind, a first batch to start from.
 */

export interface DustScroll {
  /** The kind it teaches (a `DustDef` id). */
  readonly dustId: string;
  /** Days of study given to it so far. */
  readonly sessions: number;
  /** The last day it was studied, so it is studied once a day. */
  readonly lastDay?: number;
}

/** Days of study an S-rank scroll takes to master. */
export const SCROLL_SESSIONS = 5;
/** Share of a full store a mastered scroll's first batch gives. */
export const FIRST_BATCH = 0.25;
/** Share of a full store a batch made at home gives. */
export const MADE_BATCH = 0.25;
/** Share of a full store a batch bought ready-made gives. */
export const BOUGHT_BATCH = 0.5;

export function scrollMastered(scroll: DustScroll): boolean {
  return scroll.sessions >= SCROLL_SESSIONS;
}

/** The scroll after a day's study. */
export function studiedScroll(scroll: DustScroll, day: number): DustScroll {
  return { ...scroll, sessions: Math.min(SCROLL_SESSIONS, scroll.sessions + 1), lastDay: day };
}

/** How much a batch of this share of a full store adds, never past the cap. */
export function batchAdded(count: number, cap: number, share: number): number {
  return Math.min(cap, count + Math.round(cap * share));
}
