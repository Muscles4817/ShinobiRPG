import { clamp } from '@/core';
import { blowsOf, type EffectOf, type TechniqueEffect } from '@/systems/techniques';

import type { BodySize, CombatAttributes, CombatantSetup, CombatTechnique } from '../contract';
import { elementMultiplier } from './elements';
import { driveOf, toughnessKept, type EffectUse } from './verbs';
import { sizeToughness } from './size';

/**
 * How hard hits land and how much heals restore, shared by the engines built on `rules/`.
 * Damage comes from the gap between the attacker's power and the defender's defence, never
 * from absolute values: two equals trade blows the same way at grade E and at grade S, and each
 * grade of difference makes the stronger side hit much harder and the weaker much softer.
 * Every human has 100 health. Damage rolls swing only a little; the swing in a fight comes from
 * decisions (dodged, guarded, countered).
 */

/** Damage of a plain blow between equals, out of the 100 health every human has. */
export const BLOW_DAMAGE = 20;
/** How steeply damage follows the power-to-defence ratio. */
export const GAP_EXPONENT = 1.8;
/**
 * Share of defence that is skill: a trained fighter reads, rolls with and blunts a blow, so
 * their best art protects them alongside the body. Without it, attacks (driven by an art people
 * specialise in) met only stamina (which few train), and equals one-shot each other.
 */
export const SKILL_DEFENCE_SHARE = 0.7;
/**
 * Share of the defence against a physical attack (a blow, a blade, a taijutsu or kenjutsu
 * technique) that guard can make up: everyone catches and rolls with blows (the skill share of
 * toughness), and hand-to-hand skill and strength catch them better still. A ready Guard is a
 * boost on top (`defence.ts`).
 */
export const BASE_GUARD_SHARE = 0.3;
/** No single hit takes more than this share of the target's health: a fight is never one blow. */
export const MAX_HIT_SHARE = 0.5;
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
/** A wild technique, easier to slip (`defence.ts`), hits this much harder when it lands. */
export const WILD_DAMAGE = 1.2;

/** Anyone with a stat line (and, for a big body, its size): the ratings below read nothing else. */
interface Rated {
  readonly attributes: CombatAttributes;
  readonly size?: BodySize;
  readonly empowered?: { readonly grows?: number };
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

/** The fighter's best art: the skill that defends them whatever comes at them. */
export function bestArt(f: Rated): number {
  const a = f.attributes;
  return Math.max(a.taijutsu, a.ninjutsu, a.genjutsu, a.kenjutsu, a.fuuinjutsu);
}

/** A defence of the body or the will, blended with the fighter's skill. */
function withSkill(f: Rated, base: number): number {
  return base * (1 - SKILL_DEFENCE_SHARE) + bestArt(f) * SKILL_DEFENCE_SHARE;
}

/**
 * Toughness: stamina, how much punishment the body takes before it gives, and the skill to take
 * it well. Armour is kit (`kitDamageScale`); later, toughness is also what resists injury.
 */
export function toughness(f: Rated): number {
  // A bigger body takes a blow better (`size.ts`).
  return withSkill(f, f.attributes.stamina) * sizeToughness(f);
}

/** Guard: how well blows are caught and rolled with, mostly taijutsu, some strength. */
export function guardRating(f: Rated): number {
  return f.attributes.taijutsu * 0.6 + f.attributes.strength * 0.4;
}

/**
 * What a physical attack meets: toughness, or better where a fighter's guard is better (a
 * brawler catches a punch a scholar of seals only rolls with).
 */
export function physicalDefence(f: Rated): number {
  const body = toughness(f);
  return Math.max(body, body * (1 - BASE_GUARD_SHARE) + guardRating(f) * BASE_GUARD_SHARE);
}

/**
 * What a hit may take at most from a fighter with this much health: half, or more from a body
 * bigger than its target (`hitCapShare` in `size.ts`).
 */
export function cappedHit(damage: number, maxHealth: number, share = MAX_HIT_SHARE): number {
  return Math.min(damage, Math.max(1, Math.round(maxHealth * share)));
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

/**
 * What a technique meets: a genjutsu meets the will, a physical art the body and its guard,
 * everything else the body (less of either against a break).
 */
function defenceAgainst(defender: Rated, use: EffectUse): number {
  const { discipline } = use.technique;
  if (discipline === 'genjutsu') return withSkill(defender, defender.attributes.willpower);
  const physical = BODY_POWER[discipline] !== null;
  return (physical ? physicalDefence(defender) : toughness(defender)) * toughnessKept(use);
}

/** A plain blow: strength and taijutsu against toughness and guard. */
export function strikeDamage(attacker: Rated, defender: Rated, roll: number): number {
  const scale = gapScale(blowPower(attacker), physicalDefence(defender));
  return Math.max(1, Math.round(BLOW_DAMAGE * scale * variance(roll)));
}

/**
 * A damaging effect (a hit, an area hit, a break or a sprung trap): its power, what drives it
 * against what it meets, and elements.
 */
export function techniqueDamage(
  attacker: Natured,
  defender: Natured,
  use: EffectUse<'damage' | 'area' | 'break' | 'trap'>,
  roll: number,
): number {
  const { technique, effect } = use;
  const scale = gapScale(effectPower(attacker, use), defenceAgainst(defender, use));
  const weight = TECHNIQUE_BASE + effect.power * TECHNIQUE_PER_POWER;
  const elements = elementMultiplier(technique, attacker.nature);
  const wild = technique.accuracy === 'wild' ? WILD_DAMAGE : 1;
  return Math.max(1, Math.round(BLOW_DAMAGE * weight * scale * elements * wild * variance(roll)));
}

/** A heal restores its power, more in skilled hands (ninjutsu and chakra control by default). */
export function healAmount(user: Rated, use: EffectUse<'heal'>): number {
  return Math.round(use.effect.power * (1 + driveOf(user, use) * HEAL_PER_SKILL));
}

/** Health every human has (`MAX_HEALTH`), for reads against an equal. */
const EQUAL_HEALTH = 100;

function isWoundingEffect(e: TechniqueEffect): e is EffectOf<'damage' | 'area' | 'break'> {
  return e.verb === 'damage' || e.verb === 'area' || e.verb === 'break';
}

/**
 * The share of an equal's health one use of a technique takes (a copy of the fighter, the
 * middle of the damage roll, every wounding effect summed, each capped as a hit is): what the
 * academy tells you a technique does in your hands. Null for a technique that doesn't wound.
 */
export function equalHitShare(fighter: Natured, technique: CombatTechnique): number | null {
  const hits = technique.effects.filter(isWoundingEffect).map((effect) => {
    const damage = techniqueDamage(fighter, fighter, { technique, effect }, 0.5);
    const blows = blowsOf(effect);
    return cappedHit(damage / blows, EQUAL_HEALTH) * blows;
  });
  if (hits.length === 0) return null;
  return Math.min(1, hits.reduce((sum, h) => sum + h, 0) / EQUAL_HEALTH);
}
