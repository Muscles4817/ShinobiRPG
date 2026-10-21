import { clamp } from '@/core';

import type { CombatDust, DustKind } from '../dustContract';
import { gapRatio } from './damage';
import { dustPace } from './dust';
import type { HitType } from './hits';

/**
 * The automatic shield (`docs/design/retinue-plan.md`, the dust shield): dust that rises on its
 * own between its user and a hit that would land, with no slot and no turn. It is a perk of
 * where the power came from (a tailed beast, a bound spirit: the `shield` perk), laid over
 * whatever dust its user commands, the same for any engine:
 *  - It is quick but not instant: it rises at its dust's pace (`dustPace`), and an
 *    attacker fast enough outruns it (`OUTRUN_FROM` to `OUTRUN_FULL` times that pace).
 *  - It keeps out up to what it holds (heavier dust more, a break half as much), and a hit
 *    bigger than that comes through with what is left over.
 *  - Every block spends dust for what it kept out; with too little to hand it can't rise.
 *  - An illusion is in the mind, and no dust stands in its way.
 */

/** The middle grade (C) of a dust quality. */
const MIDDLE_GRADE = 3;
/** Against anyone it isn't outrun by, it rises this often. */
const RISE_TOP = 0.9;
/** An attacker this many times its pace starts to outrun it; at the second, always. */
const OUTRUN_FROM = 1.1;
const OUTRUN_FULL = 1.8;
/** Health a shield of middling weight keeps out of one hit. */
const SHIELD_HOLDS = 24;
/** Each grade of weight above C keeps out this share more. */
const HOLDS_PER_WEIGHT = 0.12;
/** A break (a blow made to smash defences) meets this share of what the shield holds. */
const BREAK_HOLDS = 0.5;
/** Dust spent per point of health kept out. */
export const DUST_PER_HEALTH = 1;
/** With less than this to hand, the shield can't rise. */
export const SHIELD_MIN_DUST = 10;
/**
 * Dust a block of a hold, a seal or a drain costs: what a Gentle Fist's touch or a binding
 * asks of the sand, in health it would have kept out.
 */
export const CONDITION_BLOCK = 10;

/** How often the shield rises against an attacker this fast (0 without enough dust). */
export function shieldRises(dust: CombatDust, attackerSpeed: number): number {
  if (dust.count < SHIELD_MIN_DUST) return 0;
  const pace = gapRatio(attackerSpeed, dustPace(dust.kind));
  return RISE_TOP * clamp((OUTRUN_FULL - pace) / (OUTRUN_FULL - OUTRUN_FROM), 0, 1);
}

/** Whether a hit of this type meets the shield at all: an illusion never does. */
export function shieldMeets(hit: HitType): boolean {
  return hit !== 'mind';
}

/** Health the shield keeps out of one hit, before what its dust can pay for. */
export function shieldHolds(kind: DustKind, breaks: boolean): number {
  const weight = 1 + (kind.qualities.weight - MIDDLE_GRADE) * HOLDS_PER_WEIGHT;
  return SHIELD_HOLDS * weight * (breaks ? BREAK_HOLDS : 1);
}

/** What a risen shield does to a hit: how much it kept out, and the dust that cost. */
export interface ShieldBlock {
  readonly kept: number;
  readonly cost: number;
}

/** A risen shield meets a hit of this force: it keeps out what it holds and its dust pays for. */
export function shieldBlock(dust: CombatDust, force: number, breaks: boolean): ShieldBlock {
  const affords = dust.count / DUST_PER_HEALTH;
  const kept = Math.max(0, Math.round(Math.min(force, shieldHolds(dust.kind, breaks), affords)));
  return { kept, cost: Math.min(dust.count, Math.ceil(kept * DUST_PER_HEALTH)) };
}
