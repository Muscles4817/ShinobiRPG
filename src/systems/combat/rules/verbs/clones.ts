import { clamp } from '@/core';

import type { EffectUse } from './use';

/**
 * Clone: decoys standing beside their maker, in the maker's row. How many come from the
 * technique's power and the maker's reserves (max chakra, until reserves are a stat of their
 * own). A single-target hit that reaches the maker may strike a clone instead, which bursts;
 * the better the maker's art against the attacker's eyes, the more often. An area hit bursts
 * them all. Solid clones also throw a weak blow of their own when their maker attacks.
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
/** A solid clone's blow lands this much as hard as its maker's. */
export const CLONE_BLOW_SCALE = 0.25;

/** Clones standing with a fighter. */
export interface Clones {
  readonly techniqueId: string;
  readonly count: number;
  /** The maker's drive when making them: what an attacker's eyes are measured against. */
  readonly skill: number;
  /** Solid clones that attack alongside their maker. */
  readonly strikes: boolean;
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

/** The clones after one bursts. */
export function oneBurst(clones: Clones): Clones {
  return { ...clones, count: Math.max(0, clones.count - 1) };
}
