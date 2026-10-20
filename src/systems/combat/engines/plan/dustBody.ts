import type { CombatDust } from '../../dustContract';

/** What a fighter carries of dust in a planned fight (`dust.ts`). */

/** Blinding dust in a fighter's eyes: how strong, and for how many exchanges more. */
export interface Blinded {
  readonly blinding: number;
  readonly exchanges: number;
}

export interface Dusty {
  /** The dust they command; absent for most. */
  readonly dust?: CombatDust;
  /** Someone's blinding dust in their eyes. */
  readonly blinded?: Blinded;
}
