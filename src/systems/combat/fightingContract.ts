/**
 * How a fighter wants to fight, set outright (`docs/design/combat-ai-plan.md` Part 4): for a
 * named character whose style is canon or story, or by the game for a fight's purpose (a spar,
 * an exam bout, a cornered rogue). Whatever is left out is derived from the fighter's body, kit
 * and traits by the engine. Each number is a weight from 0 to 1, never a chance of doing
 * something, and none of them makes a fighter better: competence comes from their stats.
 */

/** Which objectives a fighter reaches for first. */
export const COMBAT_PHILOSOPHIES = ['overwhelm', 'outlast', 'outwit', 'protect'] as const;
export type CombatPhilosophy = (typeof COMBAT_PHILOSOPHIES)[number];

export interface CombatFighting {
  /** Weights over the philosophies (normalised by the engine); a fighter may hold two. */
  readonly philosophy?: Partial<Record<CombatPhilosophy, number>>;
  /** The distance they fight from (a `RangeBand`, spelt out so this file imports nothing). */
  readonly range?: 'close' | 'mid' | 'far';
  /** How much being at that distance is worth to them. */
  readonly rangePull?: number;
  /** Damage dealt now over damage avoided. */
  readonly aggression?: number;
  /** Plans judged on their upside (high) or their worst case (low). */
  readonly risk?: number;
  /** Chakra, breath and tools kept for later. */
  readonly resources?: number;
  /** How readily new evidence changes their approach. */
  readonly adaptability?: number;
  /** The indirect route: hiding, feints, baiting a seen defence. */
  readonly deception?: number;
  /** How firmly a chosen plan holds, and how little bait moves it. */
  readonly discipline?: number;
}
