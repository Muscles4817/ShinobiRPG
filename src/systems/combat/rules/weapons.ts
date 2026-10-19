import { clamp } from '@/core';

import type { NeededWeapon } from '@/systems/techniques';

import type { CombatAttributes, CombatTechnique } from '../contract';
import {
  HELD_SHAPES,
  shapeOf,
  type CombatGear,
  type CombatWeapon,
  type WeaponClass,
} from '../gearContract';
import {
  BLOW_DAMAGE,
  blowPower,
  gapRatio,
  gapScale,
  strikeDamage,
  physicalDefence,
  variance,
} from './damage';
import { rankStep } from './gearRank';
import type { AttackKind } from './kit';
import { weaponArt } from './mastery';

/**
 * What weapons do, in every fight style. Gear never adds to stats: a weapon changes a card.
 *  - A blade turns Strike into a cut, driven by the weapon art at the blade's mastery (with
 *    strength and footwork behind it, as for kenjutsu techniques); kenjutsu techniques can't
 *    be used without one. What else a weapon in hand changes (reach, openness, full hands) is
 *    `blades.ts`.
 *  - A blunt weapon (a staff, a club) puts the weapon art and strength into a blow.
 *  - Knuckles put more into a blow, and part of it goes through a guard.
 *  - Throwing steel makes the kunai card hit harder; senbon hit softer but may daze, more so
 *    for sharp eyes against dull ones. A throw is the weapon art at its mastery, aimed by
 *    perception.
 * Each class handles its own way: its speed (initiative, and how fast a blow arrives), its
 * weight (damage, going through a guard) and the guard it gives its wielder. A better rank
 * makes each of these better. A unique weapon adds its own verbs to its strikes.
 */

interface ClassRule {
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
}

const NO_EXTRAS = { pierce: 0, piercePerRank: 0, daze: 0, dazePerRank: 0 } as const;

const CLASS_RULES: Readonly<Record<WeaponClass, ClassRule>> = {
  'light-blade': { ...NO_EXTRAS, scale: 1.15, scalePerRank: 0.1, speed: 2, guard: 0 },
  sword: { ...NO_EXTRAS, scale: 1.25, scalePerRank: 0.1, speed: 1, guard: 0.05 },
  greatsword: {
    ...NO_EXTRAS,
    scale: 1.45,
    scalePerRank: 0.1,
    pierce: 0.2,
    speed: -1,
    guard: 0.3,
  },
  polearm: { ...NO_EXTRAS, scale: 1.2, scalePerRank: 0.1, speed: 0, guard: 0.15 },
  fan: { ...NO_EXTRAS, scale: 1.1, scalePerRank: 0.08, speed: 1, guard: 0.05 },
  chain: { ...NO_EXTRAS, scale: 1.15, scalePerRank: 0.1, speed: 0, guard: 0 },
  staff: { ...NO_EXTRAS, scale: 1.1, scalePerRank: 0.06, daze: 0.1, speed: 0, guard: 0.25 },
  blunt: {
    scale: 1.35,
    scalePerRank: 0.08,
    pierce: 0.2,
    piercePerRank: 0.03,
    daze: 0.15,
    dazePerRank: 0.03,
    speed: -1,
    guard: 0.1,
  },
  knuckles: {
    ...NO_EXTRAS,
    scale: 1.1,
    scalePerRank: 0.06,
    pierce: 0.25,
    piercePerRank: 0.05,
    speed: 0,
    guard: 0,
  },
  throwing: { ...NO_EXTRAS, scale: 1.2, scalePerRank: 0.1, speed: 0, guard: 0 },
  senbon: {
    scale: 0.75,
    scalePerRank: 0.07,
    ...NO_EXTRAS,
    daze: 0.15,
    dazePerRank: 0.05,
    speed: 2,
    guard: 0,
  },
};

/** How quick a weapon is: −1 slow, 0 even, up to 2 very fast. */
export function speedOf(weapon: Pick<CombatWeapon, 'weaponClass'>): number {
  return CLASS_RULES[weapon.weaponClass].speed;
}

/** The share more of a blow (and of a counter) a weapon's wielder turns aside. */
export function weaponGuard(weapon: Pick<CombatWeapon, 'weaponClass'>): number {
  return CLASS_RULES[weapon.weaponClass].guard;
}

/** A thrown kunai, unimproved, lands this share of a plain strike. */
export const PLAIN_THROW_SCALE = 0.6;
/** Share of a blade's power from the body (strength and footwork), as for kenjutsu techniques. */
const CUT_BODY_SHARE = 0.4;
/** A unique weapon that dazes may do so this often, on top of its class's chance. */
const UNIQUE_DAZE = 0.25;
/** A daze chance never rises above this, whatever the eyes behind it. */
const MAX_DAZE = 0.5;
/** A draining weapon drinks this much chakra per point of damage it deals. */
export const DRAIN_PER_DAMAGE = 0.5;

/** Why a technique that needs a weapon in hand won't play without it. */
export const NEEDS_WEAPON: Readonly<Record<NeededWeapon, string>> = {
  blade: 'Needs a blade. Equip one before the fight.',
  knuckles: 'Needs knuckles. Equip them before the fight.',
};

interface Armed {
  readonly attributes: CombatAttributes;
  readonly gear?: CombatGear;
}

/** What one strike or throw does before the target's defences answer it. */
export interface Attack {
  readonly raw: number;
  /** What hit, for the narration: "strike", "cut", "kunai", "senbon". */
  readonly what: string;
  readonly kind: AttackKind;
  /** Share of a guard it goes through. */
  readonly pierce: number;
  /** Chance it dazes, if it lands. */
  readonly daze: number;
  /** Chakra drained per point of damage, if it lands. */
  readonly drain: number;
}

/** A weapon's numbers at its rank, with a unique weapon's verbs on top (for rules and shops). */
export interface WeaponNumbers {
  readonly scale: number;
  readonly pierce: number;
  readonly daze: number;
  readonly drain: number;
}

export function weaponNumbers(weapon: Omit<CombatWeapon, 'name'>): WeaponNumbers {
  const rule = CLASS_RULES[weapon.weaponClass];
  const step = rankStep(weapon.rank);
  const effects = weapon.effects ?? [];
  return {
    scale: rule.scale + rule.scalePerRank * step,
    pierce: effects.includes('sunder') ? 1 : rule.pierce + rule.piercePerRank * step,
    daze: rule.daze + rule.dazePerRank * step + (effects.includes('daze') ? UNIQUE_DAZE : 0),
    drain: effects.includes('drain') ? DRAIN_PER_DAMAGE : 0,
  };
}

/** Power behind a cut: the weapon art at the blade's mastery, with strength and footwork. */
export function cutPower(f: Armed, weapon: CombatWeapon): number {
  const { strength, speed } = f.attributes;
  const art = weaponArt(f, weapon.weaponClass);
  return art * (1 - CUT_BODY_SHARE) + ((strength + speed) / 2) * CUT_BODY_SHARE;
}

/** Power behind a blunt weapon's blow: the weapon art at its mastery, and strength. */
function bluntPower(f: Armed, weapon: CombatWeapon): number {
  const art = weaponArt(f, weapon.weaponClass);
  return art * (1 - CUT_BODY_SHARE) + f.attributes.strength * CUT_BODY_SHARE;
}

/** Share of a throw's power that is aim (perception); the rest is the weapon art. */
const THROW_AIM_SHARE = 0.4;

/** Power behind a throw: the weapon art at the throw's mastery, aimed by perception. */
export function throwPower(f: Armed, weaponClass: WeaponClass): number {
  const art = weaponArt(f, weaponClass);
  return art * (1 - THROW_AIM_SHARE) + f.attributes.perception * THROW_AIM_SHARE;
}

/** A weapon's daze chance against this target: perception against perception. */
function dazeAgainst(chance: number, attacker: Armed, defender: Armed): number {
  if (chance <= 0) return 0;
  const eyes = gapRatio(attacker.attributes.perception, defender.attributes.perception);
  return clamp(chance * eyes, 0, MAX_DAZE);
}

function attackWith(
  weapon: CombatWeapon,
  power: number,
  { attacker, defender, roll }: { attacker: Armed; defender: Armed; roll: number },
): Omit<Attack, 'what' | 'kind'> {
  const n = weaponNumbers(weapon);
  return {
    raw: BLOW_DAMAGE * gapScale(power, physicalDefence(defender)) * n.scale * variance(roll),
    pierce: n.pierce,
    daze: dazeAgainst(n.daze, attacker, defender),
    drain: n.drain,
  };
}

const PLAIN = { pierce: 0, daze: 0, drain: 0 } as const;

/** A blow arrives this much faster for each step of its weapon's speed (`avoid.ts`). */
export const ARRIVAL_PER_SPEED = 0.04;

/**
 * The weapon art behind a weapon's blow or throw on its way, as the avoid roll reads it: the art
 * at the weapon's mastery (a throw aimed by perception), quicker for a quick weapon. Without a
 * weapon in hand, the plain kunai or the bare art.
 */
export function weaponSkill(f: Armed, thrown: boolean): number {
  const weapon = thrown ? (thrownWeapon(f) ?? PLAIN_KUNAI) : heldWeapon(f);
  if (!weapon) return f.attributes.kenjutsu;
  const skill = thrown ? throwPower(f, weapon.weaponClass) : weaponArt(f, weapon.weaponClass);
  return skill * (1 + ARRIVAL_PER_SPEED * speedOf(weapon));
}

/** The held weapon, when it is one the strike uses. */
function heldWeapon(f: Armed): CombatWeapon | null {
  const held = f.gear?.held;
  return held && HELD_SHAPES.includes(shapeOf(held)) ? held : null;
}

/** The strike card: a plain blow, a cut with a blade, or a weapon's or knuckles' blow. */
export function strikeWith(attacker: Armed, defender: Armed, roll: number): Attack {
  const held = heldWeapon(attacker);
  const hit = { attacker, defender, roll };
  const shape = held && shapeOf(held);
  if (held && shape === 'blade') {
    return { ...attackWith(held, cutPower(attacker, held), hit), what: 'cut', kind: 'weapon' };
  }
  if (held && shape === 'blunt') {
    return { ...attackWith(held, bluntPower(attacker, held), hit), what: 'strike', kind: 'weapon' };
  }
  if (held) return { ...attackWith(held, blowPower(attacker), hit), what: 'strike', kind: 'blow' };
  return { ...PLAIN, raw: strikeDamage(attacker, defender, roll), what: 'strike', kind: 'blow' };
}

/** A thrown weapon, when it is one the kunai card uses. */
function thrownWeapon(f: Armed): CombatWeapon | null {
  const thrown = f.gear?.thrown;
  return thrown && !HELD_SHAPES.includes(shapeOf(thrown)) ? thrown : null;
}

/** The plain kunai everyone carries: throwing steel's mastery, at no better than a strike. */
const PLAIN_KUNAI: CombatWeapon = { name: 'kunai', weaponClass: 'throwing', rank: 'D' };

/** The kunai card: plain kunai, better throwing steel, or senbon. */
export function throwWith(attacker: Armed, defender: Armed, roll: number): Attack {
  const thrown = thrownWeapon(attacker);
  const weapon = thrown ?? PLAIN_KUNAI;
  const power = throwPower(attacker, weapon.weaponClass);
  if (!thrown) {
    const raw = BLOW_DAMAGE * gapScale(power, physicalDefence(defender)) * variance(roll);
    return { ...PLAIN, raw: raw * PLAIN_THROW_SCALE, what: 'kunai', kind: 'weapon' };
  }
  const hit = attackWith(thrown, power, { attacker, defender, roll });
  const what = shapeOf(thrown) === 'senbon' ? 'senbon' : 'kunai';
  return { ...hit, raw: hit.raw * PLAIN_THROW_SCALE, what, kind: 'weapon' };
}

/**
 * Why a technique can't be used with what the fighter holds: its `needs.weapon` (every blade
 * art needs a blade, validated). Only fighters whose gear is known are held to it (foes and
 * teammates are armed as their techniques suggest).
 */
export function weaponMissing(
  f: Pick<Armed, 'gear'>,
  technique: Pick<CombatTechnique, 'needs'>,
): string | null {
  const needed = technique.needs?.weapon;
  if (f.gear === undefined || needed === undefined) return null;
  const held = f.gear.held;
  return held && shapeOf(held) === needed ? null : NEEDS_WEAPON[needed];
}
