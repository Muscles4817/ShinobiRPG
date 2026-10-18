import type { SenseiFeedback } from './senseis';

/**
 * Content schema for the curriculum: the things a sensei shows a new genin, one at a time, in
 * the order their philosophy puts first, most of them just before the thing they are about
 * (`game/sensei/curriculum.ts`). This is the game's tutorial, spoken by the sensei in their
 * manner, never as a manual. `{sensei}` is their name (with pronoun forms), `{place}` where
 * they meet you.
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
  /** What they do as they show you: narration, naming them. */
  readonly scene: string;
  /** What they do when they stop you just before the thing itself, if it differs. */
  readonly before?: string;
  /** What they say, by their manner (no numbers, no rules). */
  readonly says: Readonly<Record<SenseiFeedback, string>>;
}
