import { hashUnit } from '@/core';
import type { CompanionKindDef } from '@/content';
import {
  BODY_STATS,
  bodyCeiling,
  bodyValue,
  genesFrom,
  lifeStage,
  maturity,
  type BodyStat,
  type Companion,
  type LifeStage,
} from '@/systems/companions';
import { limitsFor, type Limits, type Stats } from '@/systems/stats';

/**
 * A companion's body (`systems/companions/growth.ts`) for this animal: its genes, rolled from
 * the save's seed and its id (fixed for its life), the body its age gives it, and the ceiling
 * nothing passes. Skills keep the talent limits; body stats are capped by the body.
 */

export type Genes = Readonly<Record<BodyStat, number>>;

export function genesOf(
  companion: Pick<Companion, 'id'>,
  kind: CompanionKindDef,
  seed: number,
): Genes {
  const entries = BODY_STATS.map(
    (stat) =>
      [stat, genesFrom(hashUnit(seed, 'genes', companion.id, stat), kind.temperament)] as const,
  );
  return Object.fromEntries(entries) as Genes;
}

/** How grown it is, 0 to 1. */
export function grownShare(
  companion: Pick<Companion, 'grownDays'>,
  kind: CompanionKindDef,
): number {
  return maturity(companion.grownDays, kind.body.maturesInDays);
}

export function stageOfLife(
  companion: Pick<Companion, 'grownDays'>,
  kind: CompanionKindDef,
): LifeStage {
  return lifeStage(grownShare(companion, kind));
}

/**
 * Its stats with the body caught up to its age: a body stat is never below what its age gives
 * it (trained senses stay trained) and never above its ceiling.
 */
export function withGrownBody(
  companion: Pick<Companion, 'id' | 'grownDays' | 'stats'>,
  kind: CompanionKindDef,
  seed: number,
): Stats {
  const genes = genesOf(companion, kind, seed);
  const grown = grownShare(companion, kind);
  const body = BODY_STATS.map((stat) => {
    const adult = kind.body.adult[stat];
    const now = Math.max(companion.stats[stat], bodyValue(stat, adult, genes[stat], grown));
    return [stat, Math.min(now, bodyCeiling(adult, genes[stat]))] as const;
  });
  return { ...companion.stats, ...Object.fromEntries(body) };
}

/** How far each stat can go: skills by its talent, body stats by its body's ceiling. */
export function companionLimits(
  companion: Pick<Companion, 'id' | 'aptitude'>,
  kind: CompanionKindDef,
  seed: number,
): Limits {
  const genes = genesOf(companion, kind, seed);
  const ceilings = BODY_STATS.map(
    (stat) => [stat, bodyCeiling(kind.body.adult[stat], genes[stat])] as const,
  );
  return { ...limitsFor(companion.aptitude), ...Object.fromEntries(ceilings) };
}
