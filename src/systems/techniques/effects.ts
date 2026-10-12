import type { StatId } from '@/systems/stats';

import { costIsSane, type CostTemplate } from './costs';

/**
 * What a technique does, as a list of verbs applied in order (damage, then daze). Each verb's
 * rule and its scaling profile (which stats drive it, which resist it) live once in the combat
 * system's `rules/verbs/`; here is only the data a technique carries.
 */

export const VERBS = [
  'damage',
  'daze',
  'seal',
  'heal',
  'area',
  'confuse',
  'conceal',
  'sense',
  'break',
  'field',
  'move',
  'substitute',
  'empower',
  'clone',
  'trap',
] as const;
export type Verb = (typeof VERBS)[number];

/**
 * A stat a technique can read or raise in a fight. Reserves are not one: they size the chakra
 * pool (max chakra), they don't make a technique stronger.
 */
export type FightStat = Exclude<StatId, 'reserves'>;

/**
 * A stat that scales a verb. Besides plain stats: `art` is the fighter's skill in the
 * technique's own discipline, and `guard` is what sees that art coming (willpower against
 * genjutsu, perception against the rest).
 */
export type ScalingStat = FightStat | 'art' | 'guard';

/** Overrides a verb's scaling profile for one technique; any part left out keeps the default. */
export interface VerbScaling {
  /** The user's stats that drive the effect (averaged). */
  readonly drive?: readonly ScalingStat[];
  /** The target's stats that resist it (averaged). */
  readonly resist?: readonly ScalingStat[];
}

/**
 * Fight-wide conditions a field effect raises (mist, smoke). What each does lives once in the
 * combat system's `rules/verbs/field.ts`.
 */
export const FIELD_IDS = ['mist', 'smoke'] as const;
export type FieldId = (typeof FIELD_IDS)[number];

/** A distance a move effect takes its user to (the combat system's range bands). */
export type MoveDistance = 'close' | 'mid' | 'far';

interface EffectBase<V extends Verb> {
  readonly verb: V;
  /**
   * Strength of the effect: damage dealt (damage, area, break), how long a daze, seal or
   * confusion holds, health restored, how well a conceal hides, a sense reaches or a field
   * blinds, how much an empower raises, how many clones, how hard a trap bites. A move or a
   * substitution simply happens; their power only ranks them.
   */
  readonly power: number;
  readonly scaling?: VerbScaling;
}

/**
 * What some verbs need besides power: which field rises, where a move goes, what an empower
 * raises and what it costs, whether clones fight, whether a trap dazes.
 */
interface VerbExtras {
  readonly field: { readonly field: FieldId };
  /** Where the move goes; without it, wherever its user fights best. */
  readonly move: { readonly to?: MoveDistance };
  /**
   * A self-buff for a few exchanges (the Gates are the reference), and never free: it costs
   * the body health each exchange it holds, or leaves a price due after the fight (validated:
   * at least one of the two).
   */
  readonly empower: {
    /** The stats it raises while it holds. Never empty (validated). */
    readonly boosts: readonly FightStat[];
    /** Health the user's body pays at the end of each exchange it holds. */
    readonly healthPerExchange?: number;
    /** What it takes out of its user once the fight is over, each time it is used. */
    readonly afterCost?: CostTemplate;
  };
  /** Solid clones that throw a weak blow of their own when their maker attacks. */
  readonly clone: { readonly strikes?: true };
  /** A trap that also dazes whoever springs it. */
  readonly trap: { readonly dazes?: true };
}

type ExtrasOf<V extends Verb> = V extends keyof VerbExtras ? VerbExtras[V] : unknown;

export type TechniqueEffect = { readonly [V in Verb]: EffectBase<V> & ExtrasOf<V> }[Verb];

/** Verbs whose effects need nothing beyond their power. */
export type PlainVerb = Exclude<Verb, 'field' | 'empower'>;

/** The effect variant for one verb. */
export type EffectOf<V extends Verb> = Extract<TechniqueEffect, { readonly verb: V }>;

export type EmpowerEffect = EffectOf<'empower'>;
export type CloneEffect = EffectOf<'clone'>;
export type TrapEffect = EffectOf<'trap'>;

/**
 * Why an effect's data can't work as written, or null. An empower must raise something and
 * must cost something (a health price, an after-cost, or both), and any after-cost must be real.
 */
export function effectProblem(effect: TechniqueEffect): string | null {
  if (effect.verb !== 'empower') return null;
  if (effect.boosts.length === 0) return 'an empower that raises nothing';
  if (effect.afterCost && !costIsSane(effect.afterCost)) {
    return 'an empower whose after-cost is not positive';
  }
  const priced = (effect.healthPerExchange ?? 0) > 0 || effect.afterCost !== undefined;
  return priced ? null : 'an empower with no price (it needs a health price or an after-cost)';
}
