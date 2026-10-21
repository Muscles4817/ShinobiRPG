import { gapRatio } from './damage';

/**
 * Pace (`docs/design/defence-plan.md`, 3.4): an attacker far faster than a defender's avoid
 * rating outpaces them. Slipping fades from `OUTPACE_FROM` times the defender's rating and is
 * gone by `OUTPACE_FULL`: past it no stance, ready Dodge or committed Evade gets clear, and only
 * a swap (or, later, an S-rank defence) escapes. Only the body's attacks outpace (blows, and
 * taijutsu or kenjutsu techniques, driven by the attacker's speed): this is what the deep Gates
 * are.
 */

export const OUTPACE_FROM = 1.5;
export const OUTPACE_FULL = 2;

/** Share of the defender's slip left against an attacker this fast: 1 until outpaced, then 0. */
export function paceLeft(attackerSpeed: number, avoidRating: number): number {
  const pace = gapRatio(attackerSpeed, avoidRating);
  return Math.min(1, Math.max(0, (OUTPACE_FULL - pace) / (OUTPACE_FULL - OUTPACE_FROM)));
}
