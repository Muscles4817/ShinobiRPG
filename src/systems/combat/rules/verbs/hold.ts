import { clamp } from '@/core';

import type { EffectUse } from './use';

/**
 * Confuse and break: a genjutsu that scrambles the target's senses, and raw force that goes
 * through a guard and part of whatever toughness or armour stands in its way.
 */

/** A confusion of this power or more holds a turn longer. */
const STRONG_CONFUSION = 12;
/** Each this many points of genjutsu over (or under) the target's break rating is a turn. */
const CONFUSION_STEP = 8;
export const MAX_CONFUSION_TURNS = 3;

/**
 * Share of the target's toughness a break goes straight through. Small, because damage follows
 * the power-to-defence ratio steeply (`gapScale`): this is about half again as hard a hit.
 */
export const BREAK_TOUGHNESS = 0.15;
/** Share of what armour or a spirit's form shrugs off that a break goes through anyway. */
export const BREAK_ARMOUR = 0.5;

/**
 * Turns a confusion holds: its power and the user's genjutsu, shortened by the target's
 * ability to break an illusion (`breakRating`: mostly chakra control).
 */
export function confuseTurns(drive: number, use: EffectUse<'confuse'>, breaking: number): number {
  const base = use.effect.power >= STRONG_CONFUSION ? 2 : 1;
  return clamp(Math.round(base + (drive - breaking) / CONFUSION_STEP), 1, MAX_CONFUSION_TURNS);
}

/** The share of the target's toughness that still counts against this effect. */
export function toughnessKept(use: EffectUse): number {
  return use.effect.verb === 'break' ? 1 - BREAK_TOUGHNESS : 1;
}

/**
 * A damage scale from the target's kit (armour, a spirit's form), after a break: what it
 * shrugs off is cut by `BREAK_ARMOUR`; weaknesses stay as they are.
 */
export function brokenScale(scale: number): number {
  return scale < 1 ? 1 - (1 - scale) * (1 - BREAK_ARMOUR) : scale;
}
