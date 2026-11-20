/**
 * A fighter's persistence in getting where they fight (`keepTrying.ts`), kept apart so the
 * fighter's shape can name it without importing the rules.
 */

export const KEEP_TRYING = ['odds', 'always', 'clear'] as const;
export type KeepTrying = (typeof KEEP_TRYING)[number];

/** Exchanges in a round. */
export const ROUND_EXCHANGES = 4;

export interface Persisting {
  /** How hard they keep trying; unset, the plan's suggestion. */
  readonly keepTrying?: KeepTrying;
}
