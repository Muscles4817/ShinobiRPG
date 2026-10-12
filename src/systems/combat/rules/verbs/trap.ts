import { clamp } from '@/core';

import type { RangeBand } from '../../contract';

/**
 * Trap: set now at the distance the fight stands at, sprung by the first foe who moves into
 * that distance, or who acts there from the next exchange on. Rows don't shelter anyone from it:
 * the distance is the one the whole fight shares. Its bite is the technique's damage, driven by
 * sealing craft and intellect against toughness (`techniqueDamage`), and some traps daze. A foe
 * whose eyes (perception) beat the setter's craft may notice it and step around, and then it's
 * gone. One trap per fighter: setting another replaces it.
 */

/** A foe as sharp as the setter's craft notices the trap this often… */
const SPOT_BASE = 0.25;
/** …and each point of difference moves it this much… */
const SPOT_PER_POINT = 0.03;
/** …within these bounds. */
const SPOT_MIN = 0.05;
const SPOT_MAX = 0.6;

/** A trap a fighter has set. */
export interface SetTrap {
  readonly techniqueId: string;
  readonly band: RangeBand;
  /** The exchange it was set in: acting there springs it only from the next one. */
  readonly setOn: number;
  /** The setter's drive when setting it: what a foe's eyes are measured against. */
  readonly craft: number;
}

/** What a fighter carries of traps. Absent in fights saved before them, and before any. */
export interface TrapMemory {
  readonly trap?: SetTrap;
}

/** The trap a technique sets, here and now. */
export function trapAt(
  techniqueId: string,
  band: RangeBand,
  { craft, exchange }: { readonly craft: number; readonly exchange: number },
): SetTrap {
  return { techniqueId, band, setOn: exchange, craft };
}

/**
 * Whether a foe springs this trap: the fight stands at its distance, and either they just moved
 * the fight into it or the exchange it was set in is over.
 */
export function springs(
  trap: SetTrap,
  at: { readonly band: RangeBand; readonly exchange: number; readonly moved: boolean },
): boolean {
  return trap.band === at.band && (at.moved || at.exchange > trap.setOn);
}

/** Chance a foe notices the trap and steps around it: their eyes against the setter's craft. */
export function spotChance(trap: SetTrap, resist: number): number {
  return clamp(SPOT_BASE + (resist - trap.craft) * SPOT_PER_POINT, SPOT_MIN, SPOT_MAX);
}
