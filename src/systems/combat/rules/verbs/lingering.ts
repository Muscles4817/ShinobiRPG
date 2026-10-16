import { clamp } from '@/core';
import type { AfflictionKind, Discipline, ScalingStat } from '@/systems/techniques';

import type { CombatAttributes, CombatTechnique } from '../../contract';
import { driveOf, resistOf, type EffectUse } from './use';

/**
 * What a technique leaves on a fighter after it lands, beyond the hit itself: a pin (no
 * stepping or fleeing, and slower to dodge), lingering harm (a burn, bleeds that stack, a
 * poison that saps strength and speed), chakra drawn out, and a readied riposte. Each reads
 * the user's drive against the target's resistance (`profiles.ts`), so it works the same at
 * every grade. Engines keep the state on the fighter (`LingeringMemory`).
 */

/** A pinned fighter's chance to slip a blow is scaled by this. */
export const PIN_SLIP = 0.5;
/** Health a lingering harm takes each exchange, per point of power, between equals. */
const HARM_PER_POWER = 0.4;
/** Exchanges a lingering harm lasts. */
export const AFFLICT_EXCHANGES = 3;
/** Most bleeds a fighter carries at once. */
export const MAX_BLEEDS = 3;
/** Share of strength and speed a poison saps while it lasts. */
export const POISON_SAP = 0.15;
/** Chakra drawn out per point of power, between equals. */
const DRAIN_PER_POWER = 1;
/** Share of drained chakra a leech returns to its user. */
export const ABSORB_SHARE = 0.5;
/** However wide the gap, skill moves these effects only so far. */
const SKILL_RATIO_MIN = 0.5;
const SKILL_RATIO_MAX = 2;

/** Lingering harm on a fighter. */
export interface Affliction {
  readonly harm: AfflictionKind;
  /** Health it takes at the end of each exchange. */
  readonly perExchange: number;
  /** Exchanges it still lasts. */
  readonly exchanges: number;
}

/** Strength and speed a poison has taken. */
export interface Sap {
  readonly strength: number;
  readonly speed: number;
}

/** A riposte readied by a counter effect: the next blow at its owner is answered at once. */
export interface Riposte {
  readonly name: string;
  readonly discipline: Discipline;
  readonly power: number;
  /** The last exchange it stays ready. */
  readonly until: number;
}

/** What a pin remembers of how it was cast, for breaking it (`rules/escape.ts`). */
export interface HoldGrip {
  /** The caster's drive behind it. */
  readonly drive: number;
  /** The art it was cast with, which decides what breaks it. */
  readonly discipline: Discipline;
  /** The stats that break it (the pin's resist). */
  readonly resist: readonly ScalingStat[];
}

/** What a fighter carries of these. Absent in fights saved before they existed. */
export interface LingeringMemory {
  /** Exchanges a pin still holds at most. */
  readonly pinned?: number;
  /** How the pin was cast: absent on pins from before holds could be broken. */
  readonly grip?: HoldGrip;
  readonly afflictions?: readonly Affliction[];
  /** What a poison took from strength and speed, given back when the last poison wears off. */
  readonly sapped?: Sap;
  readonly riposte?: Riposte;
}

interface Rated {
  readonly attributes: CombatAttributes;
}

/** The user's drive against the target's resistance, kept within bounds. */
function skillRatio(user: Rated, target: Rated, use: EffectUse): number {
  const ratio = (driveOf(user, use) + 1) / (resistOf(target, use) + 1);
  return clamp(ratio, SKILL_RATIO_MIN, SKILL_RATIO_MAX);
}

export function isPinned(f: LingeringMemory): boolean {
  return (f.pinned ?? 0) > 0;
}

/** A fresh lingering harm from an afflict effect that landed. */
export function afflictionFrom(user: Rated, target: Rated, use: EffectUse<'afflict'>): Affliction {
  const scale = Math.sqrt(skillRatio(user, target, use));
  return {
    harm: use.effect.harm,
    perExchange: Math.max(1, Math.round(use.effect.power * HARM_PER_POWER * scale)),
    exchanges: AFFLICT_EXCHANGES,
  };
}

/**
 * A fresh harm on top of what a fighter carries: bleeds stack (the oldest gives way past the
 * most), while a burn or a poison refreshes the one already there, keeping the stronger.
 */
export function afflicted(list: readonly Affliction[], fresh: Affliction): Affliction[] {
  if (fresh.harm === 'bleed') {
    const bleeds = list.filter((a) => a.harm === 'bleed');
    const dropped = bleeds.length >= MAX_BLEEDS ? bleeds[0] : undefined;
    return [...list.filter((a) => a !== dropped), fresh];
  }
  const same = list.find((a) => a.harm === fresh.harm);
  const others = list.filter((a) => a.harm !== fresh.harm);
  const stronger = same && same.perExchange > fresh.perExchange ? same : fresh;
  return [...others, { ...stronger, exchanges: AFFLICT_EXCHANGES }];
}

/** The harm lingering this exchange, and what is left after it. */
export function afflictionsTick(list: readonly Affliction[]): {
  readonly harm: number;
  readonly left: Affliction[];
} {
  const harm = list.reduce((sum, a) => sum + a.perExchange, 0);
  const left = list
    .map((a) => ({ ...a, exchanges: a.exchanges - 1 }))
    .filter((a) => a.exchanges > 0);
  return { harm, left };
}

/** What a poison saps from a fighter's strength and speed. */
export function poisonSap(attributes: CombatAttributes): Sap {
  return {
    strength: Math.round(attributes.strength * POISON_SAP),
    speed: Math.round(attributes.speed * POISON_SAP),
  };
}

/** Attributes with a poison's sap taken (-1) or given back (1). */
export function withSap(attributes: CombatAttributes, sap: Sap, sign: 1 | -1): CombatAttributes {
  return {
    ...attributes,
    strength: Math.max(0, attributes.strength + sign * sap.strength),
    speed: Math.max(0, attributes.speed + sign * sap.speed),
  };
}

/** Chakra a drain draws out of the target (before what they have left limits it). */
export function drainAmount(user: Rated, target: Rated, use: EffectUse<'drain'>): number {
  return Math.round(use.effect.power * DRAIN_PER_POWER * skillRatio(user, target, use));
}

export function riposteFrom(use: EffectUse<'counter'>, exchange: number): Riposte {
  return {
    name: use.technique.name,
    discipline: use.technique.discipline,
    power: use.effect.power,
    until: exchange + 1,
  };
}

/** A readied riposte as a technique that strikes, for the damage rules. */
export function riposteTechnique(r: Riposte): CombatTechnique {
  return {
    id: 'riposte',
    name: r.name,
    discipline: r.discipline,
    effects: [{ verb: 'damage', power: r.power }],
    chakraCost: 0,
  };
}
