import type { RangeBand } from '../contract';
import {
  HELD_SHAPES,
  shapeOf,
  type CombatGear,
  type CombatWeapon,
  type WeaponClass,
} from '../gearContract';
import type { HitType } from './hits';
import { STRIKE_REACH } from './range';

/**
 * How each class of weapon handles, in every fight style: its weight (damage, going through a
 * guard), its speed in the hand (initiative, and how fast a blow arrives), the guard it gives
 * its wielder, and how far its strike reaches (a spear or a chain at mid as well as close).
 */

/** A strike that reaches mid as well as close. */
const LONG: readonly RangeBand[] = ['close', 'mid'];

export interface ClassRule {
  /** Damage against a plain strike (held) or a plain kunai's (thrown). */
  readonly scale: number;
  readonly scalePerRank: number;
  /** Share of a guard the hit goes through. */
  readonly pierce: number;
  readonly piercePerRank: number;
  /** Chance a landed hit dazes, between equals. */
  readonly daze: number;
  readonly dazePerRank: number;
  /** How quick it is in the hand: −1 slow, 0 even, up to 2 very fast (`speedOf`). */
  readonly speed: number;
  /** Share more of a blow its wielder's Guard catches, and of a counter at them it turns. */
  readonly guard: number;
  /** Where its strike reaches, when further than close: a spear or a chain at mid. */
  readonly reach?: readonly RangeBand[];
  /** The hurt it does, which armour meets (`hits.ts`): an edge, a point or a weight. */
  readonly hit: HitType;
}

const NO_EXTRAS = { pierce: 0, piercePerRank: 0, daze: 0, dazePerRank: 0 } as const;

const CLASS_RULES: Readonly<Record<WeaponClass, ClassRule>> = {
  'light-blade': { ...NO_EXTRAS, scale: 1.15, scalePerRank: 0.1, speed: 2, guard: 0, hit: 'cut' },
  sword: { ...NO_EXTRAS, scale: 1.25, scalePerRank: 0.1, speed: 1, guard: 0.05, hit: 'cut' },
  greatsword: {
    ...NO_EXTRAS,
    scale: 1.45,
    scalePerRank: 0.1,
    pierce: 0.2,
    speed: -1,
    guard: 0.3,
    hit: 'cut',
  },
  polearm: {
    ...NO_EXTRAS,
    scale: 1.2,
    scalePerRank: 0.1,
    speed: 0,
    guard: 0.15,
    reach: LONG,
    hit: 'pierce',
  },
  fan: { ...NO_EXTRAS, scale: 1.1, scalePerRank: 0.08, speed: 1, guard: 0.05, hit: 'cut' },
  chain: {
    ...NO_EXTRAS,
    scale: 1.15,
    scalePerRank: 0.1,
    speed: 0,
    guard: 0,
    reach: LONG,
    hit: 'cut',
  },
  staff: {
    ...NO_EXTRAS,
    scale: 1.1,
    scalePerRank: 0.06,
    daze: 0.1,
    speed: 0,
    guard: 0.25,
    hit: 'blunt',
  },
  blunt: {
    scale: 1.35,
    scalePerRank: 0.08,
    pierce: 0.2,
    piercePerRank: 0.03,
    daze: 0.15,
    dazePerRank: 0.03,
    speed: -1,
    guard: 0.1,
    hit: 'blunt',
  },
  knuckles: {
    ...NO_EXTRAS,
    scale: 1.1,
    scalePerRank: 0.06,
    pierce: 0.25,
    piercePerRank: 0.05,
    speed: 0,
    guard: 0,
    hit: 'blunt',
  },
  throwing: { ...NO_EXTRAS, scale: 1.2, scalePerRank: 0.1, speed: 0, guard: 0, hit: 'pierce' },
  senbon: {
    scale: 0.75,
    scalePerRank: 0.07,
    ...NO_EXTRAS,
    daze: 0.15,
    dazePerRank: 0.05,
    speed: 2,
    guard: 0,
    hit: 'pierce',
  },
};

/** How quick a weapon is: −1 slow, 0 even, up to 2 very fast. */
export function speedOf(weapon: Pick<CombatWeapon, 'weaponClass'>): number {
  return CLASS_RULES[weapon.weaponClass].speed;
}

/** The share more of a blow (and of a counter) a weapon's wielder turns aside. */
/** The hurt a weapon does: an edge, a point or a weight. */
export function hitOf(weapon: Pick<CombatWeapon, 'weaponClass'>): HitType {
  return CLASS_RULES[weapon.weaponClass].hit;
}

export function weaponGuard(weapon: Pick<CombatWeapon, 'weaponClass'>): number {
  return CLASS_RULES[weapon.weaponClass].guard;
}

export function classRule(weaponClass: WeaponClass): ClassRule {
  return CLASS_RULES[weaponClass];
}

/**
 * Where a fighter's strike reaches: further with a long weapon in hand, else up close. Only a
 * held weapon of known gear lengthens it (foes are armed as their techniques suggest).
 */
export function strikeReach(f: { readonly gear?: CombatGear }): readonly RangeBand[] {
  const held = f.gear?.held;
  if (!held || !HELD_SHAPES.includes(shapeOf(held))) return STRIKE_REACH;
  return CLASS_RULES[held.weaponClass].reach ?? STRIKE_REACH;
}
