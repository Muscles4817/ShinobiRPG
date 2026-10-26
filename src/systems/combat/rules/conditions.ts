import { clamp } from '@/core';

import type { CombatAttributes, CombatPerk, CombatTrait } from '../contract';
import { gapRatio } from './damage';
import { concealmentOf } from './verbs';
import { seesThroughIllusions } from './eyes';

/**
 * Hidden and Confused, shared by every engine. An illusionist starts hidden: they can't be
 * targeted and hit harder, until someone finds them (Search: perception and intellect against
 * their concealment, which is their genjutsu unless a conceal set it; insight always sees
 * them) or breaks the illusion (Dispel: chakra control and willpower, costs chakra). Their hits
 * can confuse, making the victim's actions misfire until willpower shakes it off; good chakra
 * control makes the confusion shorter.
 */

/** A hidden attacker's hits land this much harder. */
export const HIDDEN_DAMAGE = 1.4;
/** Chakra spent on a Dispel. */
export const DISPEL_CHAKRA = 6;
/** Chance a confused fighter's action goes wrong. */
export const MISFIRE_CHANCE = 0.35;
/** Turns a confusion lasts at most. */
export const CONFUSION_TURNS = 2;
/** How much of breaking an illusion is chakra control; the rest is willpower. */
const BREAK_CONTROL = 0.7;
/** Dispel chance between equals, and how it moves with the gap. */
const DISPEL_BASE = 0.45;
const DISPEL_PER_GAP = 0.4;
const DISPEL_MIN = 0.25;
const DISPEL_MAX = 0.95;
/** An illusionist found and in the open slips back into hiding every this many rounds. */
export const REHIDE_EVERY = 3;
/**
 * How much nearer each glimpse brings the seekers: a Search that misses, or an attack made from
 * hiding, narrows down where the hider must be. A fresh hiding place starts unknown.
 */
export const EXPOSURE_STEP = 0.2;

interface Senses {
  readonly attributes: CombatAttributes;
  readonly perks: readonly CombatPerk[];
}

interface Illusion {
  readonly attributes: CombatAttributes;
  readonly traits: readonly CombatTrait[];
  readonly concealment?: number;
  /** Glimpses since they last hid (`EXPOSURE_STEP`): misses searching for them, attacks they made. */
  readonly exposure?: number;
}

export function startsHidden(f: { readonly traits: readonly CombatTrait[] }): boolean {
  return f.traits.includes('illusionist');
}

/**
 * Chance a Search finds a hidden fighter (or the one struck traces an attack back). Insight
 * always does; otherwise eyes against concealment, and nearer for every glimpse since they hid,
 * so hiding holds best at first and a seeker who keeps at it gets there.
 */
export function searchChance(seeker: Senses, hider: Illusion): number {
  if (seeker.perks.includes('insight')) return 1;
  const senses = seeker.attributes.perception * 0.6 + seeker.attributes.intellect * 0.4;
  const closing = (hider.exposure ?? 0) * EXPOSURE_STEP;
  return clamp(0.35 + (senses - concealmentOf(hider)) * 0.06 + closing, 0.15, 0.9);
}

/**
 * How well a fighter breaks an illusion that already holds: mostly chakra control (disrupting
 * the foreign chakra), some willpower. Resisting one taking hold is willpower (`defence.ts`).
 */
export function breakRating(f: Senses): number {
  return f.attributes.chakraControl * BREAK_CONTROL + f.attributes.willpower * (1 - BREAK_CONTROL);
}

/**
 * Chance a Dispel breaks a hidden fighter's illusion (and your own confusion): control against
 * their genjutsu, and nearer for every glimpse since they hid, as a Search is.
 */
export function dispelChance(caster: Senses, hider: Illusion): number {
  const ratio = gapRatio(breakRating(caster), hider.attributes.genjutsu);
  const closing = (hider.exposure ?? 0) * EXPOSURE_STEP;
  return clamp(DISPEL_BASE + (ratio - 1) * DISPEL_PER_GAP + closing, DISPEL_MIN, DISPEL_MAX);
}

/** Turns a confusion lasts: control that matches the illusionist's genjutsu cuts it short. */
export function confusionTurns(attacker: Illusion, victim: Senses): number {
  const breaks = breakRating(victim) >= attacker.attributes.genjutsu;
  return breaks ? CONFUSION_TURNS - 1 : CONFUSION_TURNS;
}

/** Chance an illusionist's hit leaves the victim confused. */
export function confuseChance(attacker: Illusion, target: Senses): number {
  if (!attacker.traits.includes('illusionist') || seesThroughIllusions(target)) return 0;
  return clamp(
    0.35 + (attacker.attributes.genjutsu - target.attributes.willpower) * 0.05,
    0.1,
    0.6,
  );
}

/** Chance to shake off confusion at the start of your turn. */
export function shakeOffChance(f: Senses): number {
  return clamp(0.25 + f.attributes.willpower * 0.03, 0.25, 0.75);
}

/** Whether an illusionist in the open slips back into hiding this round. */
export function rehidesNow(f: { readonly traits: readonly CombatTrait[] }, round: number): boolean {
  return startsHidden(f) && round > 1 && round % REHIDE_EVERY === 0;
}
