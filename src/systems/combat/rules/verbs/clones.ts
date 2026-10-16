import { clamp } from '@/core';

import type { CloneKind } from '@/systems/techniques';

import { CLONE_RULES, cloneKindFor, kindOf } from './cloneKinds';
import type { EffectUse } from './use';

/**
 * Clone: decoys standing beside their maker, in the maker's row. How many come from the
 * technique's power and the maker's reserves (max chakra, until reserves are a stat of their
 * own). A single-target hit that reaches the maker may strike a clone instead, which bursts;
 * the better the maker's art against the attacker's eyes, the more often. An area hit bursts
 * them all. Solid clones also throw a weak blow of their own when their maker attacks, as hard
 * as their kind allows (`cloneKinds.ts`: what each kind costs, hits and holds up like). Clones
 * running ahead of a charge (their maker's, or a teammate's) may draw a holder's fire, so the
 * one behind them gets through: solid ones as often as they'd take a hit, illusions half as
 * often (a shot passes through them and the holder knows it sooner).
 */

/** Clones made: power × max chakra over this… */
const CLONE_SCALE = 300;
/** …at least one, at most this many. */
export const MAX_CLONES = 5;
/** The odds a hit picks a clone are clones against clones plus this: one clone, a third. */
const CROWD_REAL = 2;
/** A decoy takes a hit at most this often, however many there are. */
const DECOY_MAX = 0.7;
/** Each point of the maker's skill over the attacker's perception (or under) moves the odds… */
const DECOY_PER_POINT = 0.03;
/** …within these bounds. */
const DECOY_SKILL_MIN = 0.5;
const DECOY_SKILL_MAX = 1.5;
/** Eyes that read foes (insight) see through half the decoys that would fool others. */
const INSIGHT_SCALE = 0.5;

/** Clones standing with a fighter. */
export interface Clones {
  readonly techniqueId: string;
  readonly count: number;
  /** The maker's drive when making them: what an attacker's eyes are measured against. */
  readonly skill: number;
  /** Solid clones that attack alongside their maker. */
  readonly strikes: boolean;
  /** What they are made of (`cloneKinds.ts`); absent on clones made before kinds. */
  readonly kind?: CloneKind;
  /** How many were made, which an earth clone rebuilds up to. */
  readonly made?: number;
}

/** What a fighter carries of clones. Absent in fights saved before them, and before any. */
export interface CloneBody {
  readonly clones?: Clones;
}

/** How many clones a technique makes for a fighter with these reserves. */
export function cloneCount(maxChakra: number, use: EffectUse<'clone'>): number {
  return clamp(Math.floor((maxChakra * use.effect.power) / CLONE_SCALE), 1, MAX_CLONES);
}

/** The clones a technique makes, from the maker's drive and reserves. */
export function clonesFrom(drive: number, maxChakra: number, use: EffectUse<'clone'>): Clones {
  return {
    techniqueId: use.technique.id,
    count: cloneCount(maxChakra, use),
    skill: drive,
    strikes: use.effect.strikes === true,
    kind: cloneKindFor(use),
    made: cloneCount(maxChakra, use),
  };
}

/** Clones still standing beside this fighter. */
export function clonesLeft(f: CloneBody): number {
  return f.clones?.count ?? 0;
}

/**
 * Chance a single-target hit strikes a clone instead of its maker: more clones, more often; the
 * attacker's eyes (`resist`, perception by default) against the maker's skill shift it.
 */
export function decoyChance(clones: Clones, resist: number, insight: boolean): number {
  if (clones.count <= 0) return 0;
  const crowd = clones.count / (clones.count + CROWD_REAL);
  const skill = clamp(
    1 + (clones.skill - resist) * DECOY_PER_POINT,
    DECOY_SKILL_MIN,
    DECOY_SKILL_MAX,
  );
  return clamp(crowd * skill * (insight ? INSIGHT_SCALE : 1), 0, DECOY_MAX);
}

/** Each clone crowding round a fighter adds this to their chance of stepping where they want… */
const CLONE_STEP_PER = 0.05;
/** …up to this much. */
const CLONE_STEP_MAX = 0.15;

/** What clones crowding round add to their maker's step: a foe can't watch them all. */
export function cloneStepBonus(f: CloneBody): number {
  return Math.min(CLONE_STEP_MAX, clonesLeft(f) * CLONE_STEP_PER);
}

/**
 * Chance clones ahead of a charge draw the holder's fire, by the holder's eyes against them and
 * their kind (an illusion half as often, wind clones more).
 */
export function drawFireChance(clones: Clones, resist: number, insight: boolean): number {
  const chance = decoyChance(clones, resist, insight) * CLONE_RULES[kindOf(clones)].screen;
  return Math.min(DECOY_MAX, chance);
}

/** A solid clone's blow beside its maker, against the maker's own (none for an illusion). */
export function cloneBlowScale(clones: Clones): number {
  return CLONE_RULES[kindOf(clones)].blow;
}

/** What a hit that tears through a clone still carries into its maker: the clone took the rest. */
export const CLONE_CARRY_SCALE = 0.5;
/** A break that would take this share of the maker's health goes through the clone it strikes… */
const BREAK_THROUGH_SHARE = 0.5;
/** …as does any hit that would take this much. */
const OVERWHELM_SHARE = 0.8;

/**
 * Whether a hit that strikes a clone carries on into its maker: one heavy enough (a break that
 * would land hard, or anything that would take a big share of their health) bursts the clone
 * on its way through, rather than being spent on it, and lands with half its force.
 */
export function carriesThrough(raw: number, maxHealth: number, breaks: boolean): boolean {
  return raw >= maxHealth * (breaks ? BREAK_THROUGH_SHARE : OVERWHELM_SHARE);
}

/** The clones after one bursts. */
export function oneBurst(clones: Clones): Clones {
  return { ...clones, count: Math.max(0, clones.count - 1) };
}
