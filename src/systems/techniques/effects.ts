import type { StatId } from '@/systems/stats';

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
   * confusion holds, health restored, how well a conceal hides or a sense reaches.
   */
  readonly power: number;
  readonly scaling?: VerbScaling;
}

export type TechniqueEffect = { readonly [V in Verb]: EffectBase<V> }[Verb];

/** The effect variant for one verb. */
export type EffectOf<V extends Verb> = Extract<TechniqueEffect, { readonly verb: V }>;
