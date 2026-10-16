/**
 * Content schema for the curriculum: the things a sensei shows a new genin, one at a time, in
 * the order their philosophy puts first (`game/sensei/curriculum.ts`). This is the game's
 * tutorial, spoken by the sensei. `{sensei}` is filled with their name.
 */

export const CURRICULUM_BEATS = [
  'week',
  'drills',
  'spar',
  'board',
  'prep',
  'intel',
  'eat',
  'cooking',
  'pass',
  'permit',
  'exercise',
  'exam',
] as const;
export type CurriculumBeatId = (typeof CURRICULUM_BEATS)[number];

export interface CurriculumBeat {
  readonly id: CurriculumBeatId;
  readonly title: string;
  /** What they show you, in their words (no numbers). */
  readonly text: string;
}
