import { clamp, logistic } from '@/core';

import type { CombatAttributes, CombatTechnique } from '../contract';
import { blowPower, gapRatio } from './damage';
import { driveOf, landingUse, resistOf } from './verbs';

/**
 * The layers of defence every fighter has, besides toughness (`damage.ts`) and kit:
 *  - Evasion: speed, and perception to see the blow coming. A Dodge reads it.
 *  - Guard: taijutsu and strength, how well blows are caught. A Guard reads it.
 *  - Resistance: willpower against a genjutsu taking hold, perception against seeing any other
 *    technique too late. (Breaking a genjutsu once it holds is chakra control: `conditions.ts`.)
 *  - Healing: medical skill, ninjutsu with chakra control (`healAmount` in `damage.ts`).
 * Like damage, each reads the gap between two ratings, so it works the same at every grade.
 */

/** Dodge chance between equals, when a Dodge is slotted. */
export const DODGE_BASE = 0.2;
const DODGE_MIN = 0.05;
const DODGE_MAX = 0.5;
/** A Guard between equals lets this much of a hit through. */
export const GUARD_SCALE = 0.6;
/** How strongly the guard-to-power gap changes what a Guard lets through. */
const GUARD_GAP_EXPONENT = 0.5;
const GUARD_BEST = 0.35;
const GUARD_WORST = 0.85;
/** Counter chance between equals, when a Counter is slotted. */
const COUNTER_BASE = 0.4;
const COUNTER_MIN = 0.15;
const COUNTER_MAX = 0.65;
/** Resistance never rises above this, nor falls below the floor. */
const RESIST_MAX = 0.6;
const RESIST_FLOOR = 0.05;
/** How sharply resistance follows the gap. */
const RESIST_STEEPNESS = 2.5;

interface Rated {
  readonly attributes: CombatAttributes;
}

/** Evasion: mostly speed, some perception. */
export function evasion(f: Rated): number {
  return f.attributes.speed * 0.7 + f.attributes.perception * 0.3;
}

/** Guard: mostly taijutsu, some strength. */
export function guardRating(f: Rated): number {
  return f.attributes.taijutsu * 0.6 + f.attributes.strength * 0.4;
}

/** Chance a Dodge slips an attack: the defender's evasion against the attacker's speed. */
export function dodgeChance(attacker: Rated, defender: Rated): number {
  const ratio = gapRatio(evasion(defender), attacker.attributes.speed);
  return clamp(DODGE_BASE * ratio, DODGE_MIN, DODGE_MAX);
}

/** How much of a hit a Guard lets through: the defender's guard against the attacker's power. */
export function guardScale(attacker: Rated, defender: Rated): number {
  const ratio = gapRatio(blowPower(attacker), guardRating(defender));
  return clamp(GUARD_SCALE * ratio ** GUARD_GAP_EXPONENT, GUARD_BEST, GUARD_WORST);
}

/** Chance a Counter answers a blow up close: taijutsu against taijutsu. */
export function counterChance(attacker: Rated, defender: Rated): number {
  const ratio = gapRatio(defender.attributes.taijutsu, attacker.attributes.taijutsu);
  return clamp(COUNTER_BASE * ratio, COUNTER_MIN, COUNTER_MAX);
}

/**
 * Chance a technique fails to land, from the profile of its first effect aimed at a foe (by
 * default: genjutsu meets willpower, the rest perception). Nothing resists a self-aimed one.
 */
export function resistChance(attacker: Rated, defender: Rated, technique: CombatTechnique): number {
  const use = landingUse(technique);
  if (!use) return 0;
  const gap = Math.log(gapRatio(resistOf(defender, use), driveOf(attacker, use)));
  return clamp(RESIST_MAX * logistic(gap * RESIST_STEEPNESS), RESIST_FLOOR, RESIST_MAX);
}
