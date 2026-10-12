import type {
  CombatantSetup,
  CombatPerk,
  CombatRow,
  CombatTechnique,
  CombatTrait,
} from '@/systems/combat';
import { STAT_IDS, type StatId, type Stats } from '@/systems/stats';
import { maxChakra, MAX_HEALTH } from '@/systems/vitals';
import { ctx } from '@/test/gameFixtures';

/**
 * Bench fighters: a stat line, the techniques they know, their kit (traits, perks) and an
 * optional Plan & Watch loadout. Lines are built from a career scale (genin, chūnin, jōnin)
 * and a profile saying which stats are a fighter's peak, strengths and weaknesses, so the
 * numbers always sit in the grade bands of `statTier` (E–D genin, C chūnin, B–A jōnin).
 */

export const SCALES = ['genin', 'chunin', 'jonin'] as const;
export type Scale = (typeof SCALES)[number];

/** How a fighter stands in one stat, relative to their career scale. */
export type Emphasis = 'weak' | 'base' | 'strong' | 'peak';

/**
 * Stat values per scale and emphasis. Genin sit in E–D, chūnin in D–C, jōnin in C–A, with
 * the peak of each scale in the grade that rank is known for.
 */
export const SCALE_VALUES: Readonly<Record<Scale, Readonly<Record<Emphasis, number>>>> = {
  genin: { weak: 2, base: 5, strong: 9, peak: 12 },
  chunin: { weak: 5, base: 10, strong: 14, peak: 18 },
  jonin: { weak: 10, base: 16, strong: 23, peak: 30 },
};

/**
 * A value in the middle of each grade's band (see `STAT_TIERS`), for fighters that should be
 * squarely "a C" rather than on the edge of one.
 */
export const GRADE_MIDPOINT: Readonly<Record<'E' | 'D' | 'C' | 'B' | 'A', number>> = {
  E: 5,
  D: 10,
  C: 16,
  B: 24,
  A: 33,
};

/** A Plan & Watch loadout: card ids per distance, in priority order. */
export interface BenchLoadout {
  readonly close: readonly string[];
  readonly mid: readonly string[];
  readonly far: readonly string[];
}

export interface FighterSpec {
  readonly name: string;
  readonly stats: Stats;
  readonly techniques: readonly CombatTechnique[];
  readonly traits?: readonly CombatTrait[];
  readonly perks?: readonly CombatPerk[];
  /** The plan the fighter brings, when they're the player; the engine's default otherwise. */
  readonly plan?: BenchLoadout;
  /** A row to stand in, overriding the one their kit would give them. */
  readonly row?: CombatRow;
}

export type StatProfile = Partial<Readonly<Record<StatId, Emphasis>>>;

/** A stat line at a scale: every stat at `base` unless the profile says otherwise. */
export function statLine(scale: Scale, profile: StatProfile = {}): Stats {
  const values = SCALE_VALUES[scale];
  const entries = STAT_IDS.map((id) => [id, values[profile[id] ?? 'base']] as const);
  return Object.fromEntries(entries) as Record<StatId, number>;
}

/** Every stat at one value: the plainest possible fighter, for head-on comparisons. */
export function evenLine(value: number): Stats {
  return Object.fromEntries(STAT_IDS.map((id) => [id, value])) as Record<StatId, number>;
}

/** Techniques from the original pack, by id. */
export function techniques(ids: readonly string[]): CombatTechnique[] {
  return ids.map((id) => ctx.content.techniques.require(id));
}

/** The combat setup for a bench fighter, at full health and chakra (today's formulas). */
export function toSetup(spec: FighterSpec, id: string): CombatantSetup {
  return {
    id,
    name: spec.name,
    attributes: spec.stats,
    health: MAX_HEALTH,
    maxHealth: MAX_HEALTH,
    chakra: maxChakra(spec.stats),
    maxChakra: maxChakra(spec.stats),
    techniques: spec.techniques,
    ...(spec.traits ? { traits: spec.traits } : {}),
    ...(spec.perks ? { perks: spec.perks } : {}),
    ...(spec.row ? { row: spec.row } : {}),
  };
}
