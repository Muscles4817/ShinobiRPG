import type { OpeningTest } from './senseis';

/**
 * Content schema for the test a sensei sets a new team (`docs/design/sensei-plan.md`). It
 * never fails you: each round's options are ways of going at it, and how the way you chose
 * sits with the sensei's philosophy moves their first view of you. `{sensei}`, `{mate}` and
 * `{mate2}` are filled with names.
 */

/** Ways of going at a test: with the team, on your own, by a trick, or by waiting it out. */
export const TEST_APPROACHES = ['together', 'alone', 'cunning', 'patient'] as const;
export type TestApproach = (typeof TEST_APPROACHES)[number];

export interface SenseiTestOption {
  readonly label: string;
  readonly approach: TestApproach;
  /** What happens, as story (no numbers). */
  readonly result: string;
}

export interface SenseiTestRound {
  readonly prompt: string;
  readonly options: readonly SenseiTestOption[];
}

export interface SenseiTestDef {
  readonly id: Exclude<OpeningTest, 'none'>;
  readonly title: string;
  /** How the team remembers the day, after "Remember" (e.g. "the bells"). */
  readonly memory: string;
  readonly intro: string;
  readonly rounds: readonly SenseiTestRound[];
  /** Their last word on it, before they ask how much you want shown. */
  readonly close: string;
}
