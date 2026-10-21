import { clamp, round1 } from '@/core';
import type { Stats } from '@/systems/stats';

/**
 * The body's moment-to-moment condition. Health is out of a fixed 100 for everyone; the chakra
 * maximum derives from stats; energy (fatigue) and satiety (hunger) are fixed 0–100 meters.
 */
export interface Vitals {
  readonly health: number;
  readonly chakra: number;
  readonly energy: number;
  readonly satiety: number;
}

export const METER_MAX = 100;
/** Satiety lost per time slot that passes. */
export const SATIETY_DECAY_PER_SLOT = 5;
/** Hunger has stages; each lower satiety threshold makes it worse. */
export const PECKISH_THRESHOLD = 50;
/** Below this satiety the character counts as hungry. */
export const HUNGRY_THRESHOLD = 25;
/** Below this the character is starving: health drains and they are too weak for hard work. */
export const STARVING_THRESHOLD = 5;

export const HUNGER_LEVELS = ['satisfied', 'peckish', 'hungry', 'starving'] as const;
export type HungerLevel = (typeof HUNGER_LEVELS)[number];

/**
 * Every human has the same health. Stats decide how fast it goes in a fight (toughness is
 * stamina, `rules/damage.ts` in combat), not how much there is.
 */
export const MAX_HEALTH = 100;

/**
 * The chakra a body of no reserves to speak of has, before control adds to it: the floor of the
 * well everyone shares.
 */
export const CHAKRA_BASE = 40;
/**
 * Reserves that double the well (`docs/design/defence-plan.md`). Chakra grows by multiplying, not
 * adding, so a deep well dwarfs an ordinary one: a fresh genin has about 70, a jōnin over 100, a
 * monster of stamina several times that, and the beasts at the top of the scale thousands.
 */
export const RESERVES_PER_DOUBLING = 10;
/** Chakra per point of control: a little more from wasting less. */
export const CHAKRA_PER_CONTROL = 1;

/** What maximum chakra is reckoned from: the stats, and any share given to a hive for good. */
export interface ChakraBody extends Pick<Stats, 'reserves' | 'chakraControl'> {
  /** Share of chakra a hive in the body took (`systems/hives`); absent for most. */
  readonly chakraGiven?: number;
}

/** Maximum chakra: mostly reserves, a little control. Stamina feeds it only by growing reserves. */
export function maxChakra(stats: ChakraBody): number {
  const well = CHAKRA_BASE * 2 ** (Math.max(0, stats.reserves) / RESERVES_PER_DOUBLING);
  const full = well + stats.chakraControl * CHAKRA_PER_CONTROL;
  return Math.round(full * (1 - (stats.chakraGiven ?? 0)));
}

/** The reserves that give this maximum chakra at this control (never below zero). */
export function reservesFor(chakra: number, chakraControl: number): number {
  const well = chakra - chakraControl * CHAKRA_PER_CONTROL;
  if (well <= CHAKRA_BASE) return 0;
  return round1(RESERVES_PER_DOUBLING * Math.log2(well / CHAKRA_BASE));
}

export function fullVitals(stats: Stats): Vitals {
  return {
    health: MAX_HEALTH,
    chakra: maxChakra(stats),
    energy: METER_MAX,
    satiety: 80,
  };
}

export interface VitalsDelta {
  readonly health?: number;
  readonly chakra?: number;
  readonly energy?: number;
  readonly satiety?: number;
}

/** Applies a delta and clamps every meter to its valid range. */
export function adjustVitals(vitals: Vitals, delta: VitalsDelta, stats: Stats): Vitals {
  return {
    health: clamp(vitals.health + (delta.health ?? 0), 0, MAX_HEALTH),
    chakra: clamp(vitals.chakra + (delta.chakra ?? 0), 0, maxChakra(stats)),
    energy: clamp(vitals.energy + (delta.energy ?? 0), 0, METER_MAX),
    satiety: clamp(vitals.satiety + (delta.satiety ?? 0), 0, METER_MAX),
  };
}

/**
 * Passive effects of time passing (hunger). Starving slowly drains health.
 * `hungerRate` scales how fast you get hungry (some clans eat for two).
 */
export function passTime(vitals: Vitals, slots: number, stats: Stats, hungerRate = 1): Vitals {
  const decay = SATIETY_DECAY_PER_SLOT * hungerRate;
  const satietyAfter = vitals.satiety - decay * slots;
  const starvingSlots = satietyAfter < 0 ? Math.ceil(-satietyAfter / decay) : 0;
  return adjustVitals(vitals, { satiety: -decay * slots, health: -3 * starvingSlots }, stats);
}

/** A full night's sleep. Hunger reduces how well you recover. */
export function sleepRecovery(vitals: Vitals, stats: Stats): VitalsDelta {
  const wellFed = vitals.satiety >= HUNGRY_THRESHOLD;
  return {
    energy: METER_MAX,
    chakra: maxChakra(stats),
    health: Math.round(MAX_HEALTH * (wellFed ? 0.5 : 0.2)),
  };
}

export function isHungry(vitals: Vitals): boolean {
  return vitals.satiety < HUNGRY_THRESHOLD;
}

/** How hungry you are, 0 (full) to 100 (empty): the meter the player sees. */
export function hungerOf(vitals: Pick<Vitals, 'satiety'>): number {
  return METER_MAX - vitals.satiety;
}

export function hungerLevel(vitals: Pick<Vitals, 'satiety'>): HungerLevel {
  if (vitals.satiety < STARVING_THRESHOLD) return 'starving';
  if (vitals.satiety < HUNGRY_THRESHOLD) return 'hungry';
  if (vitals.satiety < PECKISH_THRESHOLD) return 'peckish';
  return 'satisfied';
}
