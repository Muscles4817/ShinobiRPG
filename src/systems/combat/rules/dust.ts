import { clamp } from '@/core';
import type { Element } from '@/systems/techniques';

import type { CombatDust, DustGift, DustKind, DustQuality } from '../dustContract';
import type { CombatGround } from '../groundContract';

/**
 * The rules of commanded dust in a fight (`dustContract.ts`), the same for any engine: what a
 * dust technique spends and a draw pulls up (in full where the ground holds the dust, a little
 * elsewhere), how heavy dust lands (harder, but slower to arrive), how hard
 * it grips a pin, how much it adds to a Guard, what its gifts leave behind (a bleed, blinded
 * eyes) and what scatters it (a bane: an element, or for brittle dust a heavy blow). Each
 * quality and gift is read here and nowhere else. Dust moves at its own pace (`dustPace`), not
 * its user's skill: a quick fighter slips it however strong its master. A fighter commanding no dust pays a dust
 * technique's chakra alone.
 */

/** The middle grade (C): a quality at it changes nothing. */
const MIDDLE_GRADE = 3;
/** How much harder dust attacks hit per grade of weight above C. */
const WEIGHT_POWER_PER_GRADE = 0.1;
/**
 * The pace dust moves at, on the stat scale: middling (C) dust as fast as a good chūnin. A
 * dust attack arrives at it, whoever commands the dust, and a shield rises at it.
 */
const DUST_PACE = 20;
/** Each grade of weight above C slows it by this much (and each below quickens it). */
const PACE_PER_WEIGHT = 2;
/** How much harder dust pins grip per grade of hold above C. */
const HOLD_PER_GRADE = 0.12;
/** Share of a hit a Guard keeps out per grade of weight, while the user has dust to raise. */
const GUARD_PER_WEIGHT = 0.05;
/** A Guard is helped only while at least this share of the cap is to hand. */
const GUARD_MIN_SHARE = 0.15;
/** Off a ground that holds it, a draw gathers back only this share (what fell near). */
const STRAY_SHARE = 0.35;
/** Share of the dust a bane scatters per point of health the hit takes. */
const BANE_PER_DAMAGE = 0.015;
/** However hard the hit, one bane scatters at most this share. */
const MOST_FROM_A_HIT = 0.5;
/** A physical hit at least this hard shatters brittle dust. */
export const HEAVY_HIT = 15;
/** Health a cutting dust's bleed takes each exchange, per strength. */
const BLEED_PER_GIFT = 2;
/** Exchanges a blinding dust stays in a foe's eyes. */
export const BLIND_EXCHANGES = 2;
/** Per strength of blinding: how much more often a blinded fighter's attacks are slipped. */
const BLIND_SLIP_PER_GIFT = 0.1;
/** Below this share of its cap dust reads as thin. */
const THIN_SHARE = 0.4;

/** A kind's grade in a quality, 1 (E) to 5 (A). */
function grade(kind: DustKind, quality: DustQuality): number {
  return kind.qualities[quality];
}

/** A kind's strength in a gift, 0 (none) to 3 (great). */
export function dustGiftOf(kind: DustKind, gift: DustGift): number {
  return kind.gifts[gift] ?? 0;
}

/** Whether a fighter has the dust a technique spends (any fighter, without dust). */
export function dustAffords(dust: CombatDust | undefined, cost: number | undefined): boolean {
  return !dust || (cost ?? 0) <= dust.count;
}

/** How much a draw of this size pulls up on this ground. */
export function drawnUp(dust: CombatDust, amount: number, ground: CombatGround): number {
  const held = dust.kind.drawnOn.includes(ground) ? 1 : STRAY_SHARE;
  return Math.round(amount * (grade(dust.kind, 'draw') / MIDDLE_GRADE) * held);
}

/** The dust after a technique draws (first) and spends from it. */
export function dustUsed(
  dust: CombatDust,
  use: { readonly draw?: number; readonly cost?: number; readonly ground: CombatGround },
): CombatDust {
  const drawn = use.draw ? drawnUp(dust, use.draw, use.ground) : 0;
  const count = Math.min(dust.cap, dust.count + drawn) - (use.cost ?? 0);
  return { ...dust, count: Math.max(0, count) };
}

/** How hard a dust attack hits, against a plain technique: heavy dust hits harder. */
export function dustPowerScale(kind: DustKind): number {
  return 1 + (grade(kind, 'weight') - MIDDLE_GRADE) * WEIGHT_POWER_PER_GRADE;
}

/** How fast a kind of dust moves: heavy dust slower. */
export function dustPace(kind: DustKind): number {
  return DUST_PACE - (grade(kind, 'weight') - MIDDLE_GRADE) * PACE_PER_WEIGHT;
}

/** How hard a dust pin grips, against a plain one. */
export function dustGripScale(kind: DustKind): number {
  return Math.max(0, 1 + (grade(kind, 'hold') - MIDDLE_GRADE) * HOLD_PER_GRADE);
}

/** How full the dust is, 0 to 1. */
export function dustFill(dust: CombatDust): number {
  return dust.cap <= 0 ? 0 : clamp(dust.count / dust.cap, 0, 1);
}

/** What a Guard lets through, against a Guard without dust: heavier dust keeps more out. */
export function dustGuardScale(dust: CombatDust | undefined): number {
  if (!dust || dustFill(dust) < GUARD_MIN_SHARE) return 1;
  return 1 - grade(dust.kind, 'weight') * GUARD_PER_WEIGHT;
}

/** Whether a hit is a bane to this dust: an element it can't bear, or heavy on brittle dust. */
function isBane(kind: DustKind, hit: DustHit): boolean {
  if (hit.element && kind.banes.includes(hit.element)) return true;
  return kind.banes.includes('heavy') && hit.physical && hit.damage >= HEAVY_HIT;
}

/** A hit on a dust user, as its dust feels it. */
export interface DustHit {
  readonly damage: number;
  readonly element?: Element;
  readonly physical: boolean;
}

/** Dust a hit scatters from its user: none unless it is a bane. */
export function scattered(dust: CombatDust, hit: DustHit): number {
  if (hit.damage <= 0 || !isBane(dust.kind, hit)) return 0;
  const share = Math.min(MOST_FROM_A_HIT, hit.damage * BANE_PER_DAMAGE);
  return Math.min(dust.count, Math.round(dust.count * share));
}

/** Health a cutting dust's bleed takes each exchange: none without the gift. */
export function dustBleed(kind: DustKind): number {
  return dustGiftOf(kind, 'cutting') * BLEED_PER_GIFT;
}

/** How often a fighter with blinding dust in their eyes has their attacks slipped. */
export function blindedSlipScale(blinding: number): number {
  return 1 + blinding * BLIND_SLIP_PER_GIFT;
}

/** Dust in a word: thick, thin or spent. */
export function dustWord(dust: CombatDust): 'thick' | 'thin' | 'spent' {
  if (dust.count <= 0) return 'spent';
  return dustFill(dust) < THIN_SHARE ? 'thin' : 'thick';
}
