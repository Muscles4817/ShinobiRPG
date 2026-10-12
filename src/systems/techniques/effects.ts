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
  'field',
  'move',
  'substitute',
] as const;
export type Verb = (typeof VERBS)[number];

/**
 * A stat that scales a verb. Besides plain stats: `art` is the fighter's skill in the
 * technique's own discipline, and `guard` is what sees that art coming (willpower against
 * genjutsu, perception against the rest). Reserves are not one: they size the chakra pool,
 * they don't make a technique stronger.
 */
export type ScalingStat = Exclude<StatId, 'reserves'> | 'art' | 'guard';

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
   * blinds. A move or a substitution simply happens; their power only ranks them.
   */
  readonly power: number;
  readonly scaling?: VerbScaling;
}

/** What some verbs need besides power: which field rises, where a move goes. */
interface VerbExtras {
  readonly field: { readonly field: FieldId };
  /** Where the move goes; without it, wherever its user fights best. */
  readonly move: { readonly to?: MoveDistance };
}

type ExtrasOf<V extends Verb> = V extends keyof VerbExtras ? VerbExtras[V] : unknown;

export type TechniqueEffect = { readonly [V in Verb]: EffectBase<V> & ExtrasOf<V> }[Verb];

/** The effect variant for one verb. */
export type EffectOf<V extends Verb> = Extract<TechniqueEffect, { readonly verb: V }>;
