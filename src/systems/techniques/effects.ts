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
  'empower',
  'clone',
  'trap',
] as const;
export type Verb = (typeof VERBS)[number];

/**
 * A stat that scales a verb. Besides plain stats: `art` is the fighter's skill in the
 * technique's own discipline, and `guard` is what sees that art coming (willpower against
 * genjutsu, perception against the rest).
 */
export type ScalingStat = StatId | 'art' | 'guard';

/** Overrides a verb's scaling profile for one technique; any part left out keeps the default. */
export interface VerbScaling {
  /** The user's stats that drive the effect (averaged). */
  readonly drive?: readonly ScalingStat[];
  /** The target's stats that resist it (averaged). */
  readonly resist?: readonly ScalingStat[];
}

interface EffectBase<V extends Verb> {
  readonly verb: V;
  /**
   * Strength of the effect: damage dealt (damage, area, break), how long a daze, seal or
   * confusion holds, health restored, how well a conceal hides or a sense reaches, how much an
   * empower raises, how many clones, how hard a trap bites.
   */
  readonly power: number;
  readonly scaling?: VerbScaling;
}

/** Verbs whose effects carry nothing beyond their power. */
export type PlainVerb = Exclude<Verb, 'empower' | 'clone' | 'trap'>;

/**
 * A self-buff for a few exchanges (the Gates are the reference), and never free: it costs the
 * body health each exchange it holds, or leaves a price due after the fight (validated: at
 * least one of the two). `power` is how much it raises the boosted stats.
 */
export interface EmpowerEffect extends EffectBase<'empower'> {
  /** The stats it raises while it holds. Never empty (validated). */
  readonly boosts: readonly StatId[];
  /** Health the user's body pays at the end of each exchange it holds. */
  readonly healthPerExchange?: number;
  /** What it takes out of its user once the fight is over, each time it is used. */
  readonly afterCost?: CostTemplate;
}

/** Decoys that take single-target hits meant for their maker. `power` is how many. */
export interface CloneEffect extends EffectBase<'clone'> {
  /** Solid clones that throw a weak blow of their own when their maker attacks. */
  readonly strikes?: true;
}

/** A trap set at the current distance, sprung by the first foe there. `power` is its damage. */
export interface TrapEffect extends EffectBase<'trap'> {
  /** It also dazes whoever springs it. */
  readonly dazes?: true;
}

export type TechniqueEffect =
  | { readonly [V in PlainVerb]: EffectBase<V> }[PlainVerb]
  | EmpowerEffect
  | CloneEffect
  | TrapEffect;

/** The effect variant for one verb. */
export type EffectOf<V extends Verb> = Extract<TechniqueEffect, { readonly verb: V }>;

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
