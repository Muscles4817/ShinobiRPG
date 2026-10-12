import { clamp } from '@/core';

import type { EffectUse } from './use';

/**
 * Conceal and sense: hiding with a technique, and reaching out for whoever hides. A conceal
 * gives its user a concealment (how hard they are to find), which every Search and sense is
 * measured against; illusionists who hide by nature conceal with their genjutsu.
 */

/** Share of a conceal's power added to its user's drive. */
const CONCEAL_POWER_SHARE = 0.2;
/** Share of a sense's power added to its user's drive. */
const SENSE_POWER_SHARE = 0.2;
/** A sense finds an equally well hidden foe this often; each point of difference moves it. */
const SENSE_BASE = 0.75;
const SENSE_PER_POINT = 0.05;
const SENSE_FLOOR = 0.4;

export interface Hider {
  readonly attributes: { readonly genjutsu: number };
  /** Set by a conceal; otherwise a fighter hides with their genjutsu. */
  readonly concealment?: number;
}

/** How hard a hidden fighter is to find. */
export function concealmentOf(hider: Hider): number {
  return hider.concealment ?? hider.attributes.genjutsu;
}

/** The concealment a conceal gives, from its user's drive (genjutsu, or ninjutsu for smoke). */
export function concealmentFrom(drive: number, use: EffectUse<'conceal'>): number {
  return drive + use.effect.power * CONCEAL_POWER_SHARE;
}

/** Chance a sense finds one hidden foe, from its user's drive (perception and ninjutsu). */
export function senseChance(drive: number, use: EffectUse<'sense'>, hider: Hider): number {
  const reach = drive + use.effect.power * SENSE_POWER_SHARE;
  return clamp(SENSE_BASE + (reach - concealmentOf(hider)) * SENSE_PER_POINT, SENSE_FLOOR, 1);
}
