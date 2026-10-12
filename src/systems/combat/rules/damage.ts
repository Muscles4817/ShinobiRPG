import { clamp } from '@/core';

import type { CombatAttributes, CombatantSetup, CombatTechnique } from '../contract';
import { elementMultiplier } from './elements';
import { driveOf, type EffectUse } from './verbs';

/**
 * How hard hits land and how much heals restore, shared by the engines built on `rules/`.
 * Damage comes from the gap between the attacker's power and the defender's defence, never
 * from absolute values: two equals trade blows the same way at grade E and at grade S, and each
 * grade of difference makes the stronger side hit much harder and the weaker much softer.
 * Every human has 100 health. Damage rolls swing only a little; the swing in a fight comes from
 * decisions (dodged, guarded, countered).
 */

/** Damage of a plain blow between equals, out of the 100 health every human has. */
export const BLOW_DAMAGE = 35;
/** How steeply damage follows the power-to-defence ratio. */
export const GAP_EXPONENT = 2.7;
/** Ratios are taken on ratings plus this, so tiny stat values don't make wild gaps. */
const RATING_OFFSET = 1;
/** The ratio counts this far either way; beyond it, more power changes nothing. */
const MAX_RATIO = 4;
/** Damage rolls land within this fraction either side of the expected hit. */
export const DAMAGE_VARIANCE = 0.08;
/** A technique hits as hard as `TECHNIQUE_BASE + power × TECHNIQUE_PER_POWER` plain blows. */
const TECHNIQUE_BASE = 0.5;
const TECHNIQUE_PER_POWER = 1 / 16;
/** A heal restores its power, plus this fraction more per point of healing skill. */
const HEAL_PER_SKILL = 1 / 20;

/** Anyone with a stat line: the ratings below read nothing else. */
interface Rated {
  readonly attributes: CombatAttributes;
}

interface Natured extends Rated {
  readonly nature?: CombatantSetup['nature'];
}

/** A roll in [0, 1) as a damage multiplier around 1. */
export function variance(roll: number): number {
  return 1 - DAMAGE_VARIANCE + roll * 2 * DAMAGE_VARIANCE;
}

/**
 * One rating against another as a ratio: 1 between equals, 2 when one is about two grades
 * above the other at any rank. Every contest in `rules/` reads gaps this way.
 */
export function gapRatio(rating: number, against: number): number {
  const ratio = (Math.max(0, rating) + RATING_OFFSET) / (Math.max(0, against) + RATING_OFFSET);
  return clamp(ratio, 1 / MAX_RATIO, MAX_RATIO);
}

/** How much a power-against-defence gap multiplies damage: 1 between equals. */
export function gapScale(power: number, defence: number): number {
  return gapRatio(power, defence) ** GAP_EXPONENT;
}

/** Power behind a plain blow: strength and taijutsu. */
export function blowPower(f: Rated): number {
  return (f.attributes.strength + f.attributes.taijutsu) / 2;
}

/**
 * Toughness: stamina, how much punishment the body takes before it gives. Armour is kit
 * (`kitDamageScale`); later, toughness is also what resists injury.
 */
export function toughness(f: Rated): number {
  return f.attributes.stamina;
}

/**
 * Body stats the physical arts add to the stats driving them: fists put strength behind a
 * blow, blades strength and footwork. They make up `BODY_SHARE` of the power.
 */
const BODY_SHARE = 0.4;
const BODY_POWER: Readonly<Record<CombatTechnique['discipline'], ((f: Rated) => number) | null>> = {
  taijutsu: ({ attributes: a }) => a.strength,
  kenjutsu: ({ attributes: a }) => (a.strength + a.speed) / 2,
  ninjutsu: null,
  genjutsu: null,
  fuuinjutsu: null,
};

/** Power behind an effect: the stats driving it, with body stats for the physical arts. */
function effectPower(attacker: Rated, use: EffectUse): number {
  const drive = driveOf(attacker, use);
  const body = BODY_POWER[use.technique.discipline];
  return body ? drive * (1 - BODY_SHARE) + body(attacker) * BODY_SHARE : drive;
}

/** What a technique meets: a genjutsu meets the will, everything else the body. */
function defenceAgainst(defender: Rated, technique: CombatTechnique): number {
  return technique.discipline === 'genjutsu' ? defender.attributes.willpower : toughness(defender);
}

/** A plain blow: strength and taijutsu against toughness. */
export function strikeDamage(attacker: Rated, defender: Rated, roll: number): number {
  const scale = gapScale(blowPower(attacker), toughness(defender));
  return Math.max(1, Math.round(BLOW_DAMAGE * scale * variance(roll)));
}

/** A damaging effect: its power, what drives it against what it meets, and elements. */
export function techniqueDamage(
  attacker: Natured,
  defender: Natured,
  use: EffectUse<'damage'>,
  roll: number,
): number {
  const { technique, effect } = use;
  const scale = gapScale(effectPower(attacker, use), defenceAgainst(defender, technique));
  const weight = TECHNIQUE_BASE + effect.power * TECHNIQUE_PER_POWER;
  const elements = elementMultiplier(technique, attacker.nature, defender.nature);
  return Math.max(1, Math.round(BLOW_DAMAGE * weight * scale * elements * variance(roll)));
}

/** A heal restores its power, more in skilled hands (ninjutsu and chakra control by default). */
export function healAmount(user: Rated, use: EffectUse<'heal'>): number {
  return Math.round(use.effect.power * (1 + driveOf(user, use) * HEAL_PER_SKILL));
}
