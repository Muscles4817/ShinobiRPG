/**
 * The ways of keeping trying to get where a fighter fights (`keepTrying.ts`), kept apart so the
 * fighter's shape (`planningShape.ts`) can name them without importing the rules.
 */

export const KEEP_TRYING = ['odds', 'always', 'clear'] as const;
export type KeepTrying = (typeof KEEP_TRYING)[number];

/** Exchanges in a round. */
export const ROUND_EXCHANGES = 4;
