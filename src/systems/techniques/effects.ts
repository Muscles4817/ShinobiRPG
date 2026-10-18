import type { StatId } from '@/systems/stats';

import { costIsSane, type CostTemplate } from './costs';
import { ladderStepProblem, type LadderStep } from './ladders';

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
  'knock',
  'pin',
  'drain',
  'afflict',
  'counter',
  'summon',
] as const;
export type Verb = (typeof VERBS)[number];

/**
 * A stat a technique can read or raise in a fight. Reserves are not one: they size the chakra
 * pool (max chakra), they don't make a technique stronger.
 */
export type FightStat = Exclude<StatId, 'reserves'>;

/**
 * A stat that scales a verb. Besides plain stats: `art` is the fighter's skill in the
 * technique's own discipline, `guard` is what sees that art coming (willpower against
 * genjutsu, perception against the rest), `bind` is what breaks a hold made with it
 * (willpower against an illusion, chakra control against chakra, strength against hands and
 * wire), and `poise` is what keeps someone on their feet against it (willpower against an
 * illusion, stamina against the rest).
 */
/**
 * What a clone is made of, which decides what it costs and what it is worth in a fight
 * (`docs/design/hittability-plan.md`, Part 4; the rules live in the combat system).
 */
export const CLONE_KINDS = [
  'illusion',
  'water',
  'wind',
  'earth',
  'lightning',
  'fire',
  'shadow',
] as const;
export type CloneKind = (typeof CLONE_KINDS)[number];

export type ScalingStat = FightStat | 'art' | 'guard' | 'bind' | 'poise';

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
export const FIELD_IDS = ['mist', 'smoke', 'dust'] as const;
export type FieldId = (typeof FIELD_IDS)[number];

/**
 * How much ground an area technique covers: a small burst a plain Guard still blunts, a wide
 * one only a barrier or a swap escapes, a vast one that can't be outrun and leaves the field
 * changed. Its rules live once in the combat system's `rules/verbs/area.ts`.
 */
export const AREA_SIZES = ['small', 'wide', 'vast'] as const;
export type AreaSize = (typeof AREA_SIZES)[number];

/** A distance a move effect takes its user to (the combat system's range bands). */
export type MoveDistance = 'close' | 'mid' | 'far';

/**
 * Lingering harm an afflict effect leaves: a burn (fire), a bleed (blades; it stacks) or a
 * poison (needles; it saps strength and speed too). Their rules live once in the combat
 * system's `rules/verbs/afflict.ts`.
 */
export const AFFLICTIONS = ['burn', 'bleed', 'poison'] as const;
export type AfflictionKind = (typeof AFFLICTIONS)[number];

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
  /** A flurry: the power split over this many blows (2–5, validated), each defended alone. */
  readonly damage: { readonly hits?: number };
  /** How much ground it covers; small when unset. */
  readonly area: { readonly size?: AreaSize };
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
    /**
     * A step of a ladder it opens (the third gate): it climbs there from the step already open
     * (`ladders.ts`) and holds until the fight ends or the body gives out.
     */
    readonly opens?: LadderStep;
  };
  /**
   * Solid clones that throw a weak blow of their own when their maker attacks, and the kind of
   * clone they are (when left out: illusions, or for solid ones, the technique's element, or
   * shadow clones).
   */
  readonly clone: { readonly strikes?: true; readonly kind?: CloneKind };
  /** A trap that also dazes whoever springs it. */
  readonly trap: { readonly dazes?: true };
  /** A pin its caster must keep holding: their turns go on it, and hurting them breaks it. */
  readonly pin: { readonly channelled?: true };
  /** Where a throw or a pull leaves the distance: away to mid or far, or dragged in close. */
  readonly knock: { readonly to: MoveDistance };
  /** A leech: part of the chakra taken flows back to the user. */
  readonly drain: { readonly absorb?: true };
  /** Which lingering harm it leaves. */
  readonly afflict: { readonly harm: AfflictionKind };
  /** Which of its user's summons it calls (`CombatCall.id`). */
  readonly summon: { readonly call: string };
}

type ExtrasOf<V extends Verb> = V extends keyof VerbExtras ? VerbExtras[V] : unknown;

export type TechniqueEffect = { readonly [V in Verb]: EffectBase<V> & ExtrasOf<V> }[Verb];

/** Verbs whose effects need nothing beyond their power. */
export type PlainVerb = Exclude<Verb, 'field' | 'empower' | 'knock' | 'afflict' | 'summon'>;

/** How many blows a wounding effect lands as: a flurry's count, or one. */
export function blowsOf(effect: TechniqueEffect): number {
  return effect.verb === 'damage' ? (effect.hits ?? 1) : 1;
}

/** The effect variant for one verb. */
export type EffectOf<V extends Verb> = Extract<TechniqueEffect, { readonly verb: V }>;

export type EmpowerEffect = EffectOf<'empower'>;
export type CloneEffect = EffectOf<'clone'>;
export type TrapEffect = EffectOf<'trap'>;

const DISTANCES: readonly string[] = ['close', 'mid', 'far'];
const harms: readonly string[] = AFFLICTIONS;
const cloneKinds: readonly string[] = CLONE_KINDS;
const sizes: readonly string[] = AREA_SIZES;

/** Most blows a flurry splits into. */
export const MAX_HITS = 5;

function hitsProblem(hits: number | undefined): string | null {
  if (hits === undefined) return null;
  return Number.isInteger(hits) && hits >= 2 && hits <= MAX_HITS
    ? null
    : `a flurry of ${hits} blows (it needs 2 to ${MAX_HITS})`;
}

function sizeProblem(size: string | undefined): string | null {
  return size === undefined || sizes.includes(size) ? null : `an area of unknown size "${size}"`;
}

/**
 * Why an effect's data can't work as written, or null. An empower must raise something and
 * must cost something (a health price, an after-cost, or both), and any after-cost must be real.
 */
export function effectProblem(effect: TechniqueEffect): string | null {
  if (effect.verb === 'damage') return hitsProblem(effect.hits);
  if (effect.verb === 'area') return sizeProblem(effect.size);
  if (effect.verb === 'knock' && !DISTANCES.includes(effect.to)) {
    return `a throw to an unknown distance "${effect.to}"`;
  }
  if (effect.verb === 'afflict' && !harms.includes(effect.harm)) {
    return `an unknown lingering harm "${effect.harm}"`;
  }
  if (effect.verb === 'clone') return cloneProblem(effect);
  return effect.verb === 'empower' ? empowerProblem(effect) : null;
}

/** Illusions can't strike, and solid clones aren't illusions. */
function cloneProblem(effect: EffectOf<'clone'>): string | null {
  if (effect.kind === undefined) return null;
  if (!cloneKinds.includes(effect.kind)) {
    return `an unknown kind of clone "${effect.kind}"`;
  }
  const illusion = effect.kind === 'illusion';
  return illusion === (effect.strikes === true) ? 'a clone whose kind and strikes disagree' : null;
}

/** An empower must raise something, open a real step if any, and cost something real. */
function empowerProblem(effect: EffectOf<'empower'>): string | null {
  if (effect.boosts.length === 0) return 'an empower that raises nothing';
  const step = effect.opens ? ladderStepProblem(effect.opens) : null;
  if (step) return `an empower that opens ${step}`;
  if (effect.afterCost && !costIsSane(effect.afterCost)) {
    return 'an empower whose after-cost is not positive';
  }
  const priced = (effect.healthPerExchange ?? 0) > 0 || effect.afterCost !== undefined;
  return priced ? null : 'an empower with no price (it needs a health price or an after-cost)';
}
