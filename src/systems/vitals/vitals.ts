import { clamp } from '@/core';
import type { Stats } from '@/systems/stats';

/**
 * The body's moment-to-moment condition. Health and chakra maxima derive from stats;
 * energy (fatigue) and satiety (hunger) are fixed 0–100 meters.
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

export function maxHealth(stats: Stats): number {
  return Math.round(60 + stats.stamina * 4 + stats.strength);
}

export function maxChakra(stats: Stats): number {
  return Math.round(30 + stats.chakraControl * 3 + stats.stamina * 1.5);
}

export function fullVitals(stats: Stats): Vitals {
  return {
    health: maxHealth(stats),
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
    health: clamp(vitals.health + (delta.health ?? 0), 0, maxHealth(stats)),
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
    health: Math.round(maxHealth(stats) * (wellFed ? 0.5 : 0.2)),
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
