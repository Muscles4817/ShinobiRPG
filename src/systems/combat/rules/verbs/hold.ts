import { clamp } from '@/core';

import type { EffectUse } from './use';

/**
 * Confuse and break: a genjutsu that scrambles the target's senses, and raw force that goes
 * through a guard and part of whatever armour or toughness stands in its way.
 */

/** A confusion of this power or more holds a turn longer. */
const STRONG_CONFUSION = 12;
/** Each this many points of genjutsu over (or under) the target's chakra control is a turn. */
const CONFUSION_STEP = 8;
export const MAX_CONFUSION_TURNS = 3;

/** Share of toughness and armour a break goes straight through. */
export const BREAK_PIERCE = 0.5;

/** Turns a confusion holds: its power and the user's genjutsu, shortened by chakra control. */
export function confusionTurns(drive: number, use: EffectUse<'confuse'>, control: number): number {
  const base = use.effect.power >= STRONG_CONFUSION ? 2 : 1;
  return clamp(Math.round(base + (drive - control) / CONFUSION_STEP), 1, MAX_CONFUSION_TURNS);
}

/** The share of the target's toughness or armour that still counts against this effect. */
export function armourKept(use: EffectUse): number {
  return use.effect.verb === 'break' ? 1 - BREAK_PIERCE : 1;
}

/**
 * A damage scale from the target's kit (armour, a spirit's form), after a break: what it
 * shrugs off is cut by `BREAK_PIERCE`; weaknesses stay as they are.
 */
export function brokenScale(scale: number): number {
  return scale < 1 ? 1 - (1 - scale) * (1 - BREAK_PIERCE) : scale;
}
