import type { StatGrade } from '@/systems/stats';

/**
 * One planner for every mind, scaled by tier (`docs/design/combat-ai-plan.md` Part 4), as the
 * prototypes measured it (`prototypes/combat-planner/timing/RESULTS.md`, ladder v3). A dull mind
 * runs the same search with a narrow view: fewer first cards, no chains, fewer seeds, and a
 * blurrier read of the others. The fight's budget per round is shared among the minds planning
 * in it by their tier's weight.
 */

export interface Tier {
  /** Single first cards scored, best by a prior that costs no exchange. */
  readonly firstK: number;
  /** Chains proposed: 0 none, 1 pairs. Lifted by expertise for a chain inside one art. */
  readonly chain: 0 | 1;
  /** The best first card is also tried with every follow-up (the safety net for ideas no fact names). */
  readonly widthOne: boolean;
  /** Seeds each candidate is scored over, budget allowing. */
  readonly rollouts: number;
  /** How far off its read of the others' attributes is, for the whole fight (±share). */
  readonly blur: number;
  /** Its share of the round's budget against the other minds planning. */
  readonly weight: number;
}

export const TIERS: Readonly<Record<StatGrade, Tier>> = {
  E: { firstK: 3, chain: 0, widthOne: false, rollouts: 2, blur: 0.3, weight: 1 },
  D: { firstK: 4, chain: 0, widthOne: false, rollouts: 3, blur: 0.2, weight: 2 },
  C: { firstK: 5, chain: 1, widthOne: false, rollouts: 4, blur: 0.1, weight: 4 },
  B: { firstK: 6, chain: 1, widthOne: false, rollouts: 6, blur: 0.05, weight: 6 },
  A: { firstK: 8, chain: 1, widthOne: false, rollouts: 8, blur: 0, weight: 9 },
  S: { firstK: 99, chain: 1, widthOne: true, rollouts: 16, blur: 0, weight: 36 },
};

/** Exchanges each candidate is played over: two (longer horizons kite, and cost). */
export const HORIZON = 2;

/** Simulated exchanges each look (before every exchange) may spend, fight-wide, by how many are fighting. */
export function roundBudget(fighting: number): number {
  if (fighting <= 2) return 900;
  return fighting <= 4 ? 600 : 400;
}
