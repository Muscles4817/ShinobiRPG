import { logistic, type Rng } from '@/core';

export interface CheckResult {
  readonly success: boolean;
  /** Probability the check had of succeeding, for display ("62% chance"). */
  readonly chance: number;
}

/** How many stat points of advantage double-ish your odds. Larger = flatter curve. */
const CHECK_SPREAD = 4;

/** Success probability of a stat check. Equal value and difficulty is a 50/50. */
export function checkChance(value: number, difficulty: number): number {
  return logistic((value - difficulty) / CHECK_SPREAD);
}

export function rollCheck(value: number, difficulty: number, rng: Rng): CheckResult {
  const chance = checkChance(value, difficulty);
  return { success: rng.chance(chance), chance };
}
