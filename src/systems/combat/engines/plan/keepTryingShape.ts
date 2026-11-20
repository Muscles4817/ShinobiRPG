/**
 * A fighter's persistence in getting where they fight (`keepTrying.ts`), and the round
 * arithmetic it needs, kept apart so the fighter's shape can name it without importing the rules.
 */

export const KEEP_TRYING = ['always', 'once', 'clear', 'odds'] as const;
export type KeepTrying = (typeof KEEP_TRYING)[number];

/** Exchanges in a round. */
export const ROUND_EXCHANGES = 4;

/** Which round of the fight an exchange falls in. */
export function roundOfExchange(exchange: number): number {
  return Math.floor((exchange - 1) / ROUND_EXCHANGES) + 1;
}

export interface Persisting {
  /** How hard they keep trying; unset, the plan's suggestion. */
  readonly keepTrying?: KeepTrying;
  /** The round of the fight in which they last tried for where they fight. */
  readonly triedFor?: number;
}
