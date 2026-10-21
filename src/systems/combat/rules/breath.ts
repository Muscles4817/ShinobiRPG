import { clamp } from '@/core';
import type { Verb } from '@/systems/techniques';

import type { CombatantSetup, CombatTechnique } from '../contract';
import { chakraCost } from './body';
import { areaCostScale } from './chakra';
import { unstableCostScale } from './unstable';

/**
 * Breath: what a body move costs. A kick, a throw, a lock or a sword's cut is muscle and timing, not chakra, so
 * it draws on the fighter's wind, a pool set by stamina that comes back a little every exchange.
 * A taijutsu fighter keeps fighting with their own moves after their chakra is spent (and while
 * a seal holds it), and tires instead: out of breath, only a plain blow is left. A move that
 * moulds chakra (an element, a Gate, a drain or a seal) still costs chakra.
 */

/** The arts worked by the body (and the weapon in its hand), not moulded: their moves cost breath. */
export const BODY_ARTS = ['taijutsu', 'kenjutsu'] as const;
export type BodyArt = (typeof BODY_ARTS)[number];

/** What a body move may do: strike, throw, hold, move and wait for an opening… */
const STRIKING_VERBS: readonly Verb[] = [
  'damage',
  'area',
  'break',
  'knock',
  'pin',
  'daze',
  'move',
  'counter',
];
/** …and a blade's cut may leave a wound that bleeds. */
const BODY_VERBS: Readonly<Record<BodyArt, ReadonlySet<Verb>>> = {
  taijutsu: new Set(STRIKING_VERBS),
  kenjutsu: new Set<Verb>([...STRIKING_VERBS, 'afflict']),
};

/** Whether an art is one the body works (taijutsu, or kenjutsu's weapon forms). */
export function isBodyArt(art: string): art is BodyArt {
  return (BODY_ARTS as readonly string[]).includes(art);
}

/** Breath everyone has… */
const BREATH_BASE = 10;
/** …and this much more for each point of stamina. */
const BREATH_PER_STAMINA = 2;
/** Breath gathered back each exchange… */
const BREATH_BACK = 2;
/** …and this much more for each point of stamina. */
const BREATH_BACK_PER_STAMINA = 0.1;
/** Skill in the art makes a move cheaper, up to this share off (as chakra control does chakra). */
const SKILL_DISCOUNT_MAX = 1 / 3;
const SKILL_DISCOUNT_AT = 60;

type Effortful = Pick<CombatTechnique, 'discipline' | 'chakraCost' | 'effects'> &
  Partial<Pick<CombatTechnique, 'element' | 'needsOpen' | 'moulded' | 'unstable'>>;

/**
 * Whether a technique is a body move: plain taijutsu or a plain weapon form of kenjutsu, paid in
 * breath rather than chakra.
 */
export function isBodyMove(t: Effortful): boolean {
  const art = t.discipline;
  if (!isBodyArt(art) || t.moulded || t.element !== undefined) return false;
  if (t.needsOpen !== undefined) return false;
  return t.effects.every((e) => BODY_VERBS[art].has(e.verb));
}

/** A fighter's whole breath, from their stamina. */
export function maxBreath(attributes: Pick<CombatantSetup['attributes'], 'stamina'>): number {
  return Math.round(BREATH_BASE + attributes.stamina * BREATH_PER_STAMINA);
}

/** Breath a body move costs: its authored cost, less for a hand skilled in its art. */
export function breathCost(
  user: { readonly attributes: Pick<CombatantSetup['attributes'], BodyArt> },
  t: Effortful,
): number {
  const skill = isBodyArt(t.discipline) ? user.attributes[t.discipline] : 0;
  const discount = clamp(skill / SKILL_DISCOUNT_AT, 0, SKILL_DISCOUNT_MAX);
  const base = t.chakraCost * unstableCostScale(t) * areaCostScale(t);
  return Math.max(1, Math.round(base * (1 - discount)));
}

/** Breath after an exchange's rest, up to the whole. */
export function breathed(
  breath: number,
  attributes: Pick<CombatantSetup['attributes'], 'stamina'>,
): number {
  const back = Math.round(BREATH_BACK + attributes.stamina * BREATH_BACK_PER_STAMINA);
  return Math.min(maxBreath(attributes), breath + back);
}

/** Which pool a technique draws on. */
export type EffortPool = 'chakra' | 'breath';

export interface Effort {
  readonly pool: EffortPool;
  readonly amount: number;
}

/** What a technique costs this user, and from which pool: breath for a body move, else chakra. */
export function effortOf(
  user: { readonly attributes: CombatantSetup['attributes'] },
  t: Effortful,
): Effort {
  return isBodyMove(t)
    ? { pool: 'breath', amount: breathCost(user, t) }
    : { pool: 'chakra', amount: chakraCost(user, t) };
}
