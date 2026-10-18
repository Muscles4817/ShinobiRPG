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
  /** The day you last watched an exam's finals from the stands (`exam/spectators.ts`). */
  readonly watchedDay: number | null;
  /** True while the fight under way is the finals you are watching. */
  readonly spectating: boolean;
}

/**
 * A promotion waiting for its scene: the rank you are being raised to and the route that earned
 * it (`exam/routes.ts`): the exam, a jōnin's nomination, a field promotion for a job, an arc's
 * recommendation, or your sensei's.
 */
export type Ceremony =
  | { readonly rank: PromotedRank; readonly route: 'exam' | 'nomination' | 'sensei' }
  | { readonly rank: 'chunin'; readonly route: 'field'; readonly missionId: string }
  | { readonly rank: 'chunin'; readonly route: 'arc'; readonly arcId: string };

export type PromotionRoute = Ceremony['route'];

export const NO_EXAMS: Exams = {
  run: null,
  lastSatDay: null,
  ceremony: null,
  watchedDay: null,
  spectating: false,
};
