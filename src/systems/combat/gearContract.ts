import type { Discipline, Verb } from '@/systems/techniques';

/**
 * The gear part of the combat contract (see `contract.ts`): what a fighter's equipped gear
 * means in a fight. Gear never adds to stats. It changes how the verbs play (a blade turns a
 * strike into a cut, armour takes the edge off blows and slows you, a focus sharpens one art),
 * and a better piece makes those numbers better. The rules live once in `rules/weapons.ts`,
 * `rules/armour.ts` and `rules/focus.ts`.
 */

/** How good a piece is: shops stock D and C (B for chūnin), A is earned or found. */
export const GEAR_RANKS = ['D', 'C', 'B', 'A'] as const;
export type GearRank = (typeof GEAR_RANKS)[number];

/**
 * What a weapon is: a blade (a strike becomes a cut; kenjutsu techniques need one), knuckles
 * (heavier blows that bite through a guard), throwing steel (better kunai) or senbon (light
 * needles that may daze). Blades and knuckles are held; throwing steel and senbon are thrown.
 */
export const WEAPON_SHAPES = ['blade', 'knuckles', 'throwing', 'senbon'] as const;
export type WeaponShape = (typeof WEAPON_SHAPES)[number];

/** Shapes held in the hand (the strike), as opposed to thrown (the kunai card). */
export const HELD_SHAPES: readonly WeaponShape[] = ['blade', 'knuckles'];

/**
 * What a unique weapon adds to every strike it lands: drain (it drinks the target's chakra),
 * daze (it may leave them reeling) or sunder (it goes through a guard).
 */
export const WEAPON_EFFECTS = ['drain', 'daze', 'sunder'] as const;
export type WeaponEffect = (typeof WEAPON_EFFECTS)[number];

/** Light (no penalty), a flak jacket, heavier shinobi armour, full samurai plate. */
export const ARMOUR_LEVELS = ['light', 'flak', 'heavy', 'plate'] as const;
export type ArmourLevel = (typeof ARMOUR_LEVELS)[number];

export interface CombatWeapon {
  readonly name: string;
  readonly shape: WeaponShape;
  readonly rank: GearRank;
  /** A unique weapon's own verbs. */
  readonly effects?: readonly WeaponEffect[];
}

export interface CombatArmour {
  readonly name: string;
  readonly level: ArmourLevel;
  readonly rank: GearRank;
}

/** What a focus sharpens: every effect of one verb, or every technique of one art. */
export type FocusTarget = { readonly verb: Verb } | { readonly discipline: Discipline };

export interface CombatFocus {
  readonly name: string;
  readonly rank: GearRank;
  readonly boosts: FocusTarget;
}

/**
 * Everything a fighter wears into a fight. Present (even empty) for fighters whose gear is
 * known, which is what makes kenjutsu techniques need a blade; absent for foes and teammates,
 * who are armed as their techniques suggest.
 */
export interface CombatGear {
  /** A blade or knuckles. */
  readonly held?: CombatWeapon;
  /** Throwing steel or senbon. */
  readonly thrown?: CombatWeapon;
  readonly armour?: CombatArmour;
  readonly focus?: CombatFocus;
}
