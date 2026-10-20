import { clamp } from '@/core';
import { SWARM_GIFTS, type SwarmGift, type SwarmQuality } from '@/systems/combat';
import type { Element } from '@/systems/techniques';

/**
 * Crossbreeding insects (`docs/design/retinue-plan.md`, step 4c): luck, forgiving when simple
 * and wild when complex. A cross's stability is set by how far apart the parents are (the same
 * species, the same family, strangers) and how many crosses deep their lineage already runs.
 * The brood's qualities land between the parents', straying further the less stable the
 * cross; gifts pass, weaken or are lost, more often lost the less stable; weaknesses pass more
 * easily than gifts. A wild cross may throw back to one parent, fail outright, or now and then
 * bring a gift out stronger than either parent's. Draws come from the caller (a hash of the
 * seed and day), never the game's Rng.
 */

/** A strain as a breeder knows it: qualities 1 (E) to 5 (A), gifts 1 to 3, and how it was bred. */
export interface StrainSheet {
  readonly id: string;
  readonly name: string;
  readonly species: string;
  readonly family: string;
  readonly qualities: Readonly<Record<SwarmQuality, number>>;
  readonly gifts: Readonly<Partial<Record<SwarmGift, number>>>;
  readonly fears: readonly Element[];
  /** Crosses deep: 0 for a strain as it is found or born. */
  readonly depth: number;
}

/** How far apart two strains are: the same species, the same family, or strangers. */
export type Kinship = 'species' | 'family' | 'strangers';

const KIN_DISTANCE: Readonly<Record<Kinship, number>> = { species: 0, family: 1, strangers: 2 };
/** A first cross within a species is this stable. */
const MOST_STABLE = 0.95;
const LEAST_STABLE = 0.1;
/** Stability lost for each step of kinship apart, and for each cross deep. */
const PER_DISTANCE = 0.25;
const PER_DEPTH = 0.1;
/** Of an unstable cross's wildness: the share that fails, and that throws back. */
const FAIL_SHARE = 0.3;
const THROWBACK_SHARE = 0.2;
/** Of its wildness, how often a gift comes out a step stronger than either parent's. */
const MUTATION_SHARE = 0.15;
/** A weakness passes this much more readily than a gift. */
const WEAKNESS_EASE = 0.25;
const TOP_GRADE = 5;
const TOP_GIFT = 3;

export function kinshipOf(a: StrainSheet, b: StrainSheet): Kinship {
  if (a.species === b.species) return 'species';
  return a.family === b.family ? 'family' : 'strangers';
}

/** How stable a cross of these two is, from 0 (a gamble) to 1 (true-breeding). */
export function stabilityOf(a: StrainSheet, b: StrainSheet): number {
  const apart = KIN_DISTANCE[kinshipOf(a, b)] * PER_DISTANCE;
  const deep = Math.max(a.depth, b.depth) * PER_DEPTH;
  return clamp(MOST_STABLE - apart - deep, LEAST_STABLE, MOST_STABLE);
}

/** What came of a cross. */
export type CrossResult =
  | { readonly kind: 'bred'; readonly strain: StrainSheet; readonly mutated: boolean }
  | { readonly kind: 'throwback'; readonly strain: StrainSheet }
  | { readonly kind: 'failed' };

/** One draw in 0–1 at a time, from the caller's hash. */
export type Draw = () => number;

function quality(a: number, b: number, wild: number, draw: Draw): number {
  const low = Math.min(a, b);
  const between = low + Math.round(draw() * (Math.max(a, b) - low));
  // A less stable cross strays a grade either way more often.
  const stray = draw() < wild ? (draw() < 0.5 ? -1 : 1) : 0;
  return clamp(between + stray, 1, TOP_GRADE);
}

function gift(a: number, b: number, stability: number, draw: Draw): number {
  const strongest = Math.max(a, b);
  const shared = a > 0 && b > 0;
  // What both parents carry a stable cross keeps; what one carries comes through less surely.
  const keep = shared ? stability : stability * 0.6;
  if (draw() < keep) return strongest;
  return draw() < stability ? strongest - 1 : 0;
}

function inherited(a: StrainSheet, b: StrainSheet, stability: number, draw: Draw) {
  const wild = 1 - stability;
  const grade = (q: SwarmQuality) => quality(a.qualities[q], b.qualities[q], wild, draw);
  const qualities: Record<SwarmQuality, number> = {
    speed: grade('speed'),
    bite: grade('bite'),
    toughness: grade('toughness'),
    brood: grade('brood'),
    size: grade('size'),
    senses: grade('senses'),
  };
  const gifts = SWARM_GIFTS.reduce<Partial<Record<SwarmGift, number>>>((sum, g) => {
    const level = gift(a.gifts[g] ?? 0, b.gifts[g] ?? 0, stability, draw);
    return level > 0 ? { ...sum, [g]: level } : sum;
  }, {});
  const fears = [...new Set([...a.fears, ...b.fears])].filter(
    (e) => (a.fears.includes(e) && b.fears.includes(e)) || draw() < stability + WEAKNESS_EASE,
  );
  return { qualities, gifts, fears };
}

/** A gift a step stronger than the brood was born with, if it has one short of great. */
function mutated(gifts: Partial<Record<SwarmGift, number>>, draw: Draw) {
  const room = SWARM_GIFTS.filter((g) => (gifts[g] ?? 0) > 0 && (gifts[g] ?? 0) < TOP_GIFT);
  const pick = room[Math.floor(draw() * room.length)];
  return pick ? { ...gifts, [pick]: (gifts[pick] ?? 0) + 1 } : gifts;
}

/** The new strain's name and id, chosen by the caller. */
export interface BroodName {
  readonly id: string;
  readonly name: string;
}

/** Crosses `hive` with `jar`: the brood, a throwback to one of them, or nothing at all. */
export function crossed(
  hive: StrainSheet,
  jar: StrainSheet,
  named: BroodName,
  draw: Draw,
): CrossResult {
  const stability = stabilityOf(hive, jar);
  const wild = 1 - stability;
  const fate = draw();
  if (fate < wild * FAIL_SHARE) return { kind: 'failed' };
  if (fate < wild * (FAIL_SHARE + THROWBACK_SHARE)) {
    return { kind: 'throwback', strain: draw() < 0.5 ? hive : jar };
  }
  const { qualities, gifts, fears } = inherited(hive, jar, stability, draw);
  const lucky = draw() < wild * MUTATION_SHARE;
  const strain: StrainSheet = {
    ...named,
    species: hive.species === jar.species ? hive.species : `${hive.species} cross`,
    family: hive.family,
    qualities,
    gifts: lucky ? mutated(gifts, draw) : gifts,
    fears,
    depth: Math.max(hive.depth, jar.depth) + 1,
  };
  return { kind: 'bred', strain, mutated: lucky };
}
