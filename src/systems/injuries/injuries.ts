import type { Rng } from '@/core';
import type { StatId } from '@/systems/stats';

/**
 * The rules of being hurt: how long an injury lasts (stamina speeds recovery), when it heals,
 * which injury a beating leaves, what a medic's treatment takes off, and chakra exhaustion (a
 * night's sleep that only partly refills your chakra). Pure functions over plain records; what
 * each injury does lives in content.
 */

/** An injury you carry. It heals on the morning of day `until`. */
export interface Injury {
  readonly injuryId: string;
  readonly until: number;
  /** A medic has already treated it; treatment works once per injury. */
  readonly treated?: boolean;
  /** A trump card's strain on one stat: that much off it in fights while the injury lasts. */
  readonly strain?: { readonly stat: StatId; readonly amount: number };
}

/** Chakra exhaustion: sleeps begun before day `until` refill only `refill` of your chakra. */
export interface Exhaustion {
  readonly until: number;
  readonly refill: number;
}

/** Each point of stamina takes this share off a new injury's days… */
export const RECOVERY_PER_STAMINA = 0.01;
/** …up to this share. */
export const MAX_STAMINA_RECOVERY = 0.5;
/** Ending a fight below this share of your chakra leaves you exhausted. */
export const DRAINED_FRACTION = 0.1;
/** How much of your chakra comes back overnight while exhausted. */
export const EXHAUSTED_REFILL = 0.5;

/** How many days a new injury lasts on someone with this much stamina (at least one). */
export function recoveryDays(days: number, stamina: number): number {
  const shortened = Math.min(MAX_STAMINA_RECOVERY, Math.max(0, stamina) * RECOVERY_PER_STAMINA);
  return Math.max(1, Math.round(days * (1 - shortened)));
}

/** Whole days until an injury (or exhaustion) is gone, as of `day`. */
export function daysLeft(entry: { readonly until: number }, day: number): number {
  return Math.max(0, entry.until - day);
}

/** Splits injuries into those still hurting on `day` and those healed by then. */
export function healedBy(
  injuries: readonly Injury[],
  day: number,
): { readonly hurting: Injury[]; readonly healed: Injury[] } {
  return {
    hurting: injuries.filter((i) => i.until > day),
    healed: injuries.filter((i) => i.until <= day),
  };
}

/** A medic's treatment halves the days left (at least one stays). Once per injury. */
export function treat(injury: Injury, day: number): Injury {
  if (injury.treated) return injury;
  const left = Math.max(1, Math.ceil(daysLeft(injury, day) / 2));
  return { ...injury, until: day + left, treated: true };
}

export interface InjuryCandidate {
  readonly id: string;
  readonly days: number;
}

/**
 * Picks an injury, weighted by how badly the fight went: `beating` 0 (the foes were nearly
 * down too) favours short injuries, 1 (they were barely scratched) favours long ones, and
 * one half weighs them all alike.
 */
export function pickInjury(
  candidates: readonly InjuryCandidate[],
  beating: number,
  rng: Rng,
): string | null {
  const longest = Math.max(...candidates.map((c) => c.days), 1);
  const exponent = 2 * Math.min(1, Math.max(0, beating)) - 1;
  const weights = candidates.map((c) => (c.days / longest) ** exponent);
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = rng.next() * total;
  for (const [i, c] of candidates.entries()) {
    roll -= weights[i] ?? 0;
    if (roll < 0) return c.id;
  }
  return candidates.at(-1)?.id ?? null;
}

/** Whether a fight ended with you nearly out of chakra. */
export function isDrained(chakra: number, maxChakra: number): boolean {
  return chakra < maxChakra * DRAINED_FRACTION;
}

/** Whether exhaustion still holds on `day`. */
export function isExhausted(exhaustion: Exhaustion | null, day: number): boolean {
  return exhaustion !== null && exhaustion.until > day;
}

/** Two spells of exhaustion: the later end and the poorer refill. */
export function addExhaustion(current: Exhaustion | null, added: Exhaustion): Exhaustion {
  if (!current) return added;
  return {
    until: Math.max(current.until, added.until),
    refill: Math.min(current.refill, added.refill),
  };
}

/** Chakra after a night's sleep begun on `day`: full, or only partly back while exhausted. */
export function chakraAfterSleep(
  vitals: { readonly chakra: number },
  maxChakra: number,
  exhaustion: { readonly state: Exhaustion | null; readonly day: number },
): number {
  if (!exhaustion.state || !isExhausted(exhaustion.state, exhaustion.day)) return maxChakra;
  return Math.max(vitals.chakra, Math.round(maxChakra * exhaustion.state.refill));
}
