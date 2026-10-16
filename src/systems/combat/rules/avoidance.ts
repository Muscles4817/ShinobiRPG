import { clamp, logistic } from '@/core';
import type { Accuracy, AreaSize, Discipline } from '@/systems/techniques';

import type { CombatAttributes } from '../contract';
import { gapRatio } from './damage';
import { slipChance } from './defence';
import { AREA_RULES, driveOf, resistOf, type EffectUse } from './verbs';

/**
 * Whether an attack reaches its target, and whether a condition then takes hold
 * (`docs/design/hittability-plan.md`). Every attack, a technique or a plain blow, meets one
 * avoid roll:
 *  - Read: the defender's eyes and wits (perception, intellect) against the attacker's speed and
 *    skill. A technique's hand signs give it away more than a blow does (`READ_EXPONENT`).
 *  - Avoid: the defender's avoid rating against how fast the attack arrives (the attacker's
 *    speed for a blow, their skill in the art for a technique). Speed (with perception) avoids
 *    most things; a genjutsu is avoided by noticing it (willpower, with perception), never by
 *    stepping aside.
 *  - Stance: everyone slips some; a ready Dodge slips much more (`STANCE`).
 *  - Shape: accuracy (`slipChance`) and an area's size (wide is hard to get clear of, vast
 *    impossible).
 * A hit that lands is not yet a hold: each condition it brings (a pin, a daze, a seal…) rolls
 * against the stat its verb names (`conditionResist`), and damage is a reduction, never a roll.
 * Like damage, every rating is a gap, so it works the same at every grade.
 */

/** Avoid chance between equals, before stance and shape, is half of this. */
const AVOID_TOP = 0.6;
/** How sharply avoiding follows the gap between avoid rating and the attack's arrival. */
const AVOID_STEEPNESS = 2;
/** What a stance makes of the base: a technique telegraphs more than a blow, a Dodge slips more. */
const STANCE: Readonly<Record<AttackForm, { readonly dodging: number; readonly open: number }>> = {
  technique: { dodging: 1.4, open: 1 },
  blow: { dodging: 0.7, open: 0.15 },
};
/** How strongly a read bends the odds: hand signs are read more easily than a fist. */
const READ_EXPONENT: Readonly<Record<AttackForm, number>> = { technique: 0.4, blow: 0.2 };
/** A read never makes slipping less likely than this share, nor more than this many times. */
const READ_MIN = 0.75;
const READ_MAX = 1.6;
/** However sharp the defender, some attacks still land. */
export const AVOID_MAX = 0.75;
/** A condition fails to take hold of an equal half this often, and never more often than this. */
const CONDITION_TOP = 0.25;
const CONDITION_FLOOR = 0.1;
const CONDITION_STEEPNESS = 2.5;

/** A technique (hand signs, a stance, a tell) or a plain blow or throw. */
export type AttackForm = 'technique' | 'blow';

interface Rated {
  readonly attributes: CombatAttributes;
}

/** How a defender slips an attack of this art: speed for most, noticing it for genjutsu. */
export function avoidRating({ attributes: a }: Rated, discipline?: Discipline): number {
  if (discipline === 'genjutsu') return a.willpower * 0.7 + a.perception * 0.3;
  return a.speed * 0.7 + a.perception * 0.3;
}

/** How well someone reads what's coming: eyes and wits. */
export function readRating({ attributes: a }: Rated): number {
  return (a.perception + a.intellect) / 2;
}

/** What an attack's read is measured against: the attacker's speed and their skill behind it. */
export function tellRating({ attributes: a }: Rated, skill: number): number {
  return (a.speed + skill) / 2;
}

/** How much a read bends the odds of slipping (1 between equals). */
export function readScale(read: number, tell: number, form: AttackForm): number {
  return clamp(gapRatio(read, tell) ** READ_EXPONENT[form], READ_MIN, READ_MAX);
}

/** One attack meeting one defender: everything the avoid roll weighs. */
export interface AvoidRoll {
  readonly form: AttackForm;
  /** The defender's avoid rating (`avoidRating`). */
  readonly rating: number;
  /** How fast it arrives: the attacker's speed (a blow) or skill in the art (a technique). */
  readonly arrival: number;
  /** The read's multiplier (`readScale`, with familiarity and foresight on top). */
  readonly read: number;
  /** A Dodge is the defender's ready defence. */
  readonly dodging: boolean;
  /** Flat chance on top (a swift kit). */
  readonly bonus?: number;
  readonly accuracy?: Accuracy;
  readonly areaSize?: AreaSize;
}

/** The chance an attack doesn't reach its target at all. */
export function avoidChance(roll: AvoidRoll): number {
  const gap = Math.log(gapRatio(roll.rating, roll.arrival));
  const base = AVOID_TOP * logistic(gap * AVOID_STEEPNESS);
  const stance = STANCE[roll.form][roll.dodging ? 'dodging' : 'open'];
  const area = roll.areaSize ? AREA_RULES[roll.areaSize].dodge : 1;
  const chance = base * stance * roll.read + (roll.bonus ?? 0);
  return Math.min(AVOID_MAX, slipChance(chance, roll.accuracy)) * area;
}

/** The chance a condition that reached its target fails to take hold, by its verb's resist. */
export function conditionResist(attacker: Rated, defender: Rated, use: EffectUse): number {
  const resist = resistOf(defender, use);
  if (resist <= 0) return 0;
  const gap = Math.log(gapRatio(resist, driveOf(attacker, use)));
  return clamp(CONDITION_TOP * logistic(gap * CONDITION_STEEPNESS), CONDITION_FLOOR, CONDITION_TOP);
}
