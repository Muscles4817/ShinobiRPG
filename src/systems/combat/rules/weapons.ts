import { clamp } from '@/core';

import type { NeededWeapon } from '@/systems/techniques';

import type { CombatAttributes, CombatTechnique } from '../contract';
import type { CombatGear, CombatWeapon, WeaponShape } from '../gearContract';
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

/**
 * What weapons do, in every fight style. Gear never adds to stats: a weapon changes a card.
 *  - A blade turns Strike into a cut, driven by kenjutsu (with strength and footwork behind
 *    it, as for kenjutsu techniques); kenjutsu techniques can't be used without one.
 *  - Knuckles put more into a blow, and part of it goes through a guard.
 *  - Throwing steel makes the kunai card hit harder; senbon hit softer but may daze, more so
 *    for sharp eyes against dull ones.
 * A better rank makes each of these better. A unique weapon adds its own verbs to its strikes.
 */

interface ShapeRule {
  /** Damage against a plain strike (held) or a plain kunai's (thrown). */
  readonly scale: number;
  readonly scalePerRank: number;
  /** Share of a guard the hit goes through. */
  readonly pierce: number;
  readonly piercePerRank: number;
  /** Chance a landed hit dazes, between equals. */
  readonly daze: number;
  readonly dazePerRank: number;
}

const SHAPE_RULES: Readonly<Record<WeaponShape, ShapeRule>> = {
  blade: { scale: 1, scalePerRank: 0.1, pierce: 0, piercePerRank: 0, daze: 0, dazePerRank: 0 },
  knuckles: {
    scale: 1.1,
    scalePerRank: 0.06,
    pierce: 0.25,
    piercePerRank: 0.05,
    daze: 0,
    dazePerRank: 0,
  },
  throwing: {
    scale: 1.2,
    scalePerRank: 0.1,
    pierce: 0,
    piercePerRank: 0,
    daze: 0,
    dazePerRank: 0,
  },
  senbon: {
    scale: 0.75,
    scalePerRank: 0.07,
    pierce: 0,
    piercePerRank: 0,
    daze: 0.15,
    dazePerRank: 0.05,
  },
};

/** A thrown kunai, unimproved, lands this share of a plain strike. */
export const PLAIN_THROW_SCALE = 0.6;
/** Share of a blade's power from the body (strength and footwork), as for kenjutsu techniques. */
const CUT_BODY_SHARE = 0.4;
/** A unique weapon that dazes may do so this often, on top of its shape's chance. */
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
  const rule = SHAPE_RULES[weapon.shape];
  const step = rankStep(weapon.rank);
  const effects = weapon.effects ?? [];
  return {
    scale: rule.scale + rule.scalePerRank * step,
    pierce: effects.includes('sunder') ? 1 : rule.pierce + rule.piercePerRank * step,
    daze: rule.daze + rule.dazePerRank * step + (effects.includes('daze') ? UNIQUE_DAZE : 0),
    drain: effects.includes('drain') ? DRAIN_PER_DAMAGE : 0,
  };
}

/** Power behind a cut: kenjutsu, with strength and footwork behind it. */
export function cutPower({ attributes: a }: Armed): number {
  return a.kenjutsu * (1 - CUT_BODY_SHARE) + ((a.strength + a.speed) / 2) * CUT_BODY_SHARE;
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

/** The held weapon, when it is one the strike uses. */
function heldWeapon(f: Armed): CombatWeapon | null {
  const held = f.gear?.held;
  return held && (held.shape === 'blade' || held.shape === 'knuckles') ? held : null;
}

/** The strike card: a plain blow, a cut with a blade, or a heavier blow with knuckles. */
export function strikeWith(attacker: Armed, defender: Armed, roll: number): Attack {
  const held = heldWeapon(attacker);
  const hit = { attacker, defender, roll };
  if (held?.shape === 'blade') {
    return { ...attackWith(held, cutPower(attacker), hit), what: 'cut', kind: 'weapon' };
  }
  if (held) return { ...attackWith(held, blowPower(attacker), hit), what: 'strike', kind: 'blow' };
  return { ...PLAIN, raw: strikeDamage(attacker, defender, roll), what: 'strike', kind: 'blow' };
}

/** The kunai card: plain kunai, better throwing steel, or senbon. */
export function throwWith(attacker: Armed, defender: Armed, roll: number): Attack {
  const thrown = attacker.gear?.thrown;
  if (!thrown || (thrown.shape !== 'throwing' && thrown.shape !== 'senbon')) {
    const raw = strikeDamage(attacker, defender, roll) * PLAIN_THROW_SCALE;
    return { ...PLAIN, raw, what: 'kunai', kind: 'weapon' };
  }
  const hit = attackWith(thrown, blowPower(attacker), { attacker, defender, roll });
  const what = thrown.shape === 'senbon' ? 'senbon' : 'kunai';
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
  return f.gear.held?.shape === needed ? null : NEEDS_WEAPON[needed];
}
