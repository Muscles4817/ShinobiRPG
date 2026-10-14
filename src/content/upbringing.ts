import type { ModifierSpec } from '@/systems/modifiers';
import type { StatDelta, StatId } from '@/systems/stats';

/**
 * How a character was built and raised: two creation choices beside the clan. The build is the
 * frame (what strength and speed can become, and what fitness costs); the upbringing is how
 * much early training a child had before the academy, and where it went.
 */

/** A body's frame. */
export interface BuildDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** What the frame gives at graduation. */
  readonly statBonuses: StatDelta;
  /** Its limits (`limitBonus`) and costs. */
  readonly modifiers: ModifierSpec;
  /** Strength the frame carries freely; more than this slows you (bulk). */
  readonly comfortStrength: number;
}

/** How a child was raised before the academy. */
export interface UpbringingDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Clan children are raised by their clan; everyone else, some other way. */
  readonly family: 'clan' | 'clanless';
  /** Development points of early training it brings. */
  readonly earlyTraining: number;
  /** Where at least `points` of the whole file's training must have gone. */
  readonly focus?: { readonly stats: 'clan-arts' | readonly StatId[]; readonly points: number };
  readonly modifiers: ModifierSpec;
}

/** Characters made before builds existed have this one. */
export const DEFAULT_BUILD_ID = 'balanced';
/** Characters made before upbringings existed were raised so, by whether they had a clan. */
export const DEFAULT_UPBRINGING = { clan: 'clan-branch', clanless: 'civilian' } as const;
