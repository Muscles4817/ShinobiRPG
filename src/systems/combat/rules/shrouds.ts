import type { ShroudKind } from '@/systems/techniques';

import type { CombatAttributes } from '../contract';
import type { HitType } from './hits';

/**
 * Cast armour (the `shroud` verb), in every fight style that plays it: armour put up by a
 * technique, held while its caster pays for it each exchange, meeting each kind of hurt its own
 * way (`hits.ts`) on top of anything worn.
 *  - Lightning over the skin turns most of every blow and jutsu, and makes its wearer faster;
 *    wind cuts through it, and it drinks chakra quickly.
 *  - A shell of sand stops nearly anything at first but wears away under sustained hurt (its
 *    integrity, set by how strongly it was cast); water soaks into it.
 *  - Hardened earth stands up to blows and blades and slows its wearer a little; lightning
 *    splits it.
 *  - Raw chakra shrouds everything a little, cheaply.
 * Illusions go through all of them.
 */

interface ShroudRule {
  /** Share of each kind of hurt that still gets through; a kind not named gets through whole. */
  readonly kept: Readonly<Partial<Record<HitType, number>>>;
  /** Share faster (or, below zero, slower) its wearer moves while it holds. */
  readonly speedLift: number;
  /** Chakra its wearer pays at the end of every exchange it holds. */
  readonly upkeep: number;
  /** For a shroud that wears away: the hurt it can take off per point of its caster's drive. */
  readonly integrityPerDrive?: number;
}

const SHROUD_RULES: Readonly<Record<ShroudKind, ShroudRule>> = {
  lightning: {
    kept: {
      blunt: 0.55,
      cut: 0.55,
      pierce: 0.5,
      chakra: 0.6,
      fire: 0.6,
      earth: 0.55,
      water: 0.65,
      lightning: 0.4,
      wind: 1.15,
    },
    speedLift: 0.2,
    upkeep: 4,
  },
  sand: {
    kept: {
      blunt: 0.3,
      cut: 0.3,
      pierce: 0.25,
      chakra: 0.45,
      fire: 0.45,
      wind: 0.5,
      earth: 0.45,
      lightning: 0.5,
      water: 0.75,
    },
    speedLift: 0,
    upkeep: 1,
    integrityPerDrive: 3,
  },
  earth: {
    kept: {
      blunt: 0.45,
      cut: 0.45,
      pierce: 0.4,
      chakra: 0.65,
      fire: 0.6,
      water: 0.6,
      wind: 0.7,
      earth: 0.5,
      lightning: 1.2,
    },
    speedLift: -0.1,
    upkeep: 2,
  },
  chakra: {
    kept: {
      blunt: 0.82,
      cut: 0.82,
      pierce: 0.82,
      chakra: 0.78,
      fire: 0.82,
      wind: 0.82,
      earth: 0.82,
      lightning: 0.82,
      water: 0.82,
    },
    speedLift: 0,
    upkeep: 3,
  },
};

/** A cast armour in force on a fighter. */
export interface Shroud {
  readonly kind: ShroudKind;
  /** How much more hurt it can take off before it gives way; absent for one that never wears. */
  readonly integrity?: number;
}

/** A fighter who may hold a cast armour. */
export interface ShroudMemory {
  readonly shroud?: Shroud;
}

/** Share of a hit of this kind that gets through a fighter's cast armour: 1 without one. */
export function shroudKept(f: ShroudMemory, hit: HitType): number {
  return f.shroud ? (SHROUD_RULES[f.shroud.kind].kept[hit] ?? 1) : 1;
}

/** A shroud cast at this drive: a sand shell as solid as its caster made it. */
export function shroudOf(kind: ShroudKind, drive: number): Shroud {
  const per = SHROUD_RULES[kind].integrityPerDrive;
  return per === undefined ? { kind } : { kind, integrity: Math.round(drive * per) };
}

/** A fighter's stats with a shroud raised (`raise`) or let fall: lightning makes them faster. */
export function shroudedAttributes(
  attributes: CombatAttributes,
  kind: ShroudKind,
  raise: boolean,
): CombatAttributes {
  const lift = 1 + SHROUD_RULES[kind].speedLift;
  const speed = raise ? attributes.speed * lift : attributes.speed / lift;
  return { ...attributes, speed };
}

/** What holding a shroud costs each exchange. */
export function shroudUpkeep(kind: ShroudKind): number {
  return SHROUD_RULES[kind].upkeep;
}

/**
 * A shroud after it took a hit of this kind that still hurt by `through`: one that wears away
 * loses what it took off the hit, and is gone (null) once worn through.
 */
export function wornShroud(shroud: Shroud, hit: HitType, through: number): Shroud | null {
  if (shroud.integrity === undefined) return shroud;
  const kept = SHROUD_RULES[shroud.kind].kept[hit] ?? 1;
  if (kept >= 1) return shroud;
  const absorbed = through * (1 / kept - 1);
  const integrity = Math.round(shroud.integrity - absorbed);
  return integrity > 0 ? { ...shroud, integrity } : null;
}
