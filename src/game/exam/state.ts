import type { PromotedRank } from '@/content';
import type { ExamRun } from '@/systems/exams';

/**
 * The exams slice of GameState: the exam you are sitting (if any), the day you last entered one
 * (a sitting can't be entered twice), and a promotion ceremony waiting to be held.
 */
export interface Exams {
  readonly run: ExamRun | null;
  readonly lastSatDay: number | null;
  readonly ceremony: Ceremony | null;
}

/** A promotion waiting for its scene: the rank you are being raised to. */
export interface Ceremony {
  readonly rank: PromotedRank;
}

export const NO_EXAMS: Exams = { run: null, lastSatDay: null, ceremony: null };
