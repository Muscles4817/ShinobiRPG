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
 * The kind of weapon, which sets how it handles (`rules/weapons.ts`: its speed, its weight and
 * the guard it gives) and which mastery it is fought with (`WeaponMastery`): a light blade
 * (a tantō), a sword, a greatsword, a polearm, a war fan, a chain or cable
 * weapon, a staff, a blunt weapon, knuckles, throwing steel or senbon.
 */
export const WEAPON_CLASSES = [
  'light-blade',
  'sword',
  'greatsword',
  'polearm',
  'fan',
  'chain',
  'staff',
  'blunt',
  'knuckles',
  'throwing',
  'senbon',
] as const;
export type WeaponClass = (typeof WEAPON_CLASSES)[number];

/**
 * What a class is to the rules: a blade (an edged held weapon: a strike becomes a cut, and
 * kenjutsu techniques need one), a blunt held weapon (blows of the weapon art), knuckles
 * (heavier blows that bite through a guard), throwing steel (better kunai) or senbon (light
 * needles that may daze). Blades, blunt weapons and knuckles are held; the rest are thrown.
 */
export const WEAPON_SHAPES = ['blade', 'blunt', 'knuckles', 'throwing', 'senbon'] as const;
export type WeaponShape = (typeof WEAPON_SHAPES)[number];

export const SHAPE_OF_CLASS: Readonly<Record<WeaponClass, WeaponShape>> = {
  'light-blade': 'blade',
  sword: 'blade',
  greatsword: 'blade',
  polearm: 'blade',
  fan: 'blade',
  chain: 'blade',
  staff: 'blunt',
  blunt: 'blunt',
  knuckles: 'knuckles',
  throwing: 'throwing',
  senbon: 'senbon',
};

/** Shapes held in the hand (the strike), as opposed to thrown (the kunai card). */
export const HELD_SHAPES: readonly WeaponShape[] = ['blade', 'blunt', 'knuckles'];

/** What a weapon of this class counts as. */
export function shapeOf(weapon: { readonly weaponClass: WeaponClass }): WeaponShape {
  return SHAPE_OF_CLASS[weapon.weaponClass];
}

/**
 * How well someone knows each class, 0 (never held one) to 1 (their signature weapon). The
 * weapon art (kenjutsu) is what any weapon fighter has; mastery is how much of it a given
 * weapon lets through (`rules/mastery.ts`).
 */
export type WeaponMastery = Readonly<Partial<Record<WeaponClass, number>>>;

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
  readonly weaponClass: WeaponClass;
  readonly rank: GearRank;
  /** A unique weapon's own verbs. */
  readonly effects?: readonly WeaponEffect[];
  /** A weapon that is also a focus (a war fan for wind, a blade that carries lightning). */
  readonly boosts?: FocusTarget;
  /**
   * Several blades in hand (twin swords, seven at once): the strike lands as a flurry, each
   * blade dodged on its own and a Guard or Counter meeting only the first (`MAX_BLADES`).
   */
  readonly blades?: number;
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
  /**
   * How well the wearer knows each class of weapon. Known with their gear; absent, they are at
   * home with whatever they carry (foes and teammates are armed as their techniques suggest).
   */
  readonly mastery?: WeaponMastery;
}

/**
 * What a fight tool does when used (see `rules/items.ts`): vanish in smoke, light up hidden
 * foes, blast one foe with a seal, restore chakra or health, or clear your head.
 */
export const COMBAT_ITEM_EFFECTS = [
  'smoke',
  'flash',
  'blast',
  'chakra',
  'heal',
  'clarity',
] as const;
export type CombatItemEffect = (typeof COMBAT_ITEM_EFFECTS)[number];

/** A kind of tool the player carries into a fight, and how many. */
export interface CombatItem {
  readonly id: string;
  readonly name: string;
  readonly effect: CombatItemEffect;
  readonly count: number;
}
