import type { CombatPerk } from '../contract';

/**
 * A veiled eye (`docs/design/defence-plan.md` 4.2): perks a fighter keeps covered
 * (`CombatantSetup.veiled`, a transplanted eye under a headband) are no use until uncovered, and
 * an uncovered eye drains its owner every exchange it stays open. Uncovering it takes no turn;
 * when its owner can no longer pay, it closes again. What foresight does once it sees is the avoid
 * roll's (`avoidance.ts`: a higher ceiling and a perfect read for Evade) and `eyes.ts`'s.
 */

/** Chakra an uncovered eye takes each exchange it stays open. */
export const EYE_UPKEEP = 3;
/** An eye is uncovered only with at least this many exchanges' upkeep in hand. */
export const EYE_RESERVE_EXCHANGES = 3;

/** What a fighter holds of a veiled eye. */
export interface Veiled {
  readonly perks: readonly CombatPerk[];
  /** Perks kept covered until revealed. */
  readonly veiled?: readonly CombatPerk[];
  /** Perks uncovered this fight, paid for each exchange. */
  readonly revealed?: readonly CombatPerk[];
  readonly chakra: number;
}

/** Whether the fighter has an eye covered and the chakra to keep it open a while. */
export function canReveal(f: Veiled): boolean {
  return (f.veiled ?? []).length > 0 && f.chakra >= EYE_UPKEEP * EYE_RESERVE_EXCHANGES;
}

/** The eye uncovered: its perks in play. */
export function uncovered(f: Veiled): Required<Pick<Veiled, 'perks' | 'veiled' | 'revealed'>> {
  const shown = f.veiled ?? [];
  return {
    perks: [...new Set([...f.perks, ...shown])],
    veiled: [],
    revealed: shown,
  };
}

/** The eye covered again: its perks out of play until it is uncovered. */
export function covered(f: Veiled): Required<Pick<Veiled, 'perks' | 'veiled' | 'revealed'>> {
  const shown = f.revealed ?? [];
  return {
    perks: f.perks.filter((p) => !shown.includes(p)),
    veiled: shown,
    revealed: [],
  };
}

/** Whether an eye is uncovered now. */
export function isRevealed(f: Pick<Veiled, 'revealed'>): boolean {
  return (f.revealed ?? []).length > 0;
}
