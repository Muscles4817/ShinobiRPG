import type { ModifierSpec } from '@/systems/modifiers';

/**
 * The stove: cooking a dish is three beats (the cut, the heat, when to take it off), each with
 * one right answer that the dish's method sets (a recipe may change one). How many land decides
 * the quality, and the quality scales everything the dish does. Pure rules; no chance in it.
 */

export const COOKING_METHODS = ['grill', 'simmer', 'steam', 'fry', 'boil'] as const;
export type CookingMethod = (typeof COOKING_METHODS)[number];

export const CUTS = ['fine', 'chunky', 'whole'] as const;
export type Cut = (typeof CUTS)[number];
export const HEATS = ['gentle', 'steady', 'fierce'] as const;
export type Heat = (typeof HEATS)[number];
export const FINISHES = ['early', 'on-time', 'late'] as const;
export type Finish = (typeof FINISHES)[number];

/** What the cook does at each beat. */
export interface CookingSteps {
  readonly cut: Cut;
  readonly heat: Heat;
  readonly finish: Finish;
}

export const BEATS = ['cut', 'heat', 'finish'] as const;
export type Beat = (typeof BEATS)[number];

/** The right way to cook by each method, unless a recipe says otherwise. */
export const METHOD_STEPS: Readonly<Record<CookingMethod, CookingSteps>> = {
  grill: { cut: 'chunky', heat: 'fierce', finish: 'early' },
  simmer: { cut: 'chunky', heat: 'gentle', finish: 'late' },
  steam: { cut: 'whole', heat: 'steady', finish: 'on-time' },
  fry: { cut: 'fine', heat: 'fierce', finish: 'early' },
  boil: { cut: 'fine', heat: 'steady', finish: 'on-time' },
};

export const MEAL_QUALITIES = ['burnt', 'plain', 'good', 'fine'] as const;
export type MealQuality = (typeof MEAL_QUALITIES)[number];

/**
 * How strongly each quality carries the dish: its fullness, energy, health and chakra, and how
 * much of each buff's effect (a 10% boost at 0.5 is 5%). A burnt dish still fills you a little.
 */
export const QUALITY_STRENGTH: Readonly<Record<MealQuality, number>> = {
  burnt: 0,
  plain: 0.6,
  good: 1,
  fine: 1.4,
};
/** A burnt dish fills you only this share as much. */
export const BURNT_FILLING = 0.5;

/** The right steps for a dish: its method's, with the recipe's own changes. */
export function rightSteps(method: CookingMethod, own?: Partial<CookingSteps>): CookingSteps {
  return { ...METHOD_STEPS[method], ...own };
}

/** Which beats the cook got right. */
export function beatsLanded(right: CookingSteps, tried: CookingSteps): readonly Beat[] {
  return BEATS.filter((b) => right[b] === tried[b]);
}

/**
 * The quality from the beats that landed, nudged by skill: a cook graded above the dish has a
 * step in hand, one cooking above their grade loses one. `skillGap` is grade minus rank.
 */
export function qualityOf(landed: number, skillGap: number): MealQuality {
  const nudge = skillGap > 0 ? 1 : skillGap < 0 ? -1 : 0;
  const index = Math.max(0, Math.min(MEAL_QUALITIES.length - 1, landed + nudge));
  return MEAL_QUALITIES[index] ?? 'plain';
}

/** Cooking without the step: plain, or good once the dish is second nature. */
export function usualQuality(mastered: boolean): MealQuality {
  return mastered ? 'good' : 'plain';
}

function scaleMultiplier(m: number, strength: number): number {
  return 1 + (m - 1) * strength;
}

function scaleRecord<K extends string>(
  record: Readonly<Partial<Record<K, number>>> | undefined,
  strength: number,
): Partial<Record<K, number>> | undefined {
  if (!record) return undefined;
  const entries = Object.entries(record) as [K, number][];
  return Object.fromEntries(entries.map(([k, m]) => [k, scaleMultiplier(m, strength)])) as Partial<
    Record<K, number>
  >;
}

/** A dish's buff at this quality: every multiplier's effect scaled, injury nights rounded down. */
export function buffAt(spec: ModifierSpec, quality: MealQuality): ModifierSpec {
  const strength = QUALITY_STRENGTH[quality];
  if (strength === 0) return {};
  const scaled = (m: number | undefined) =>
    m === undefined ? undefined : scaleMultiplier(m, strength);
  const nights = spec.injuryNights === undefined ? 0 : Math.floor(spec.injuryNights * strength);
  const entries: [keyof ModifierSpec, unknown][] = [
    ['growth', scaleRecord(spec.growth, strength)],
    ['training', scaled(spec.training)],
    ['studyDiscipline', scaleRecord(spec.studyDiscipline, strength)],
    ['studyElement', scaleRecord(spec.studyElement, strength)],
    ['hungerRate', scaled(spec.hungerRate)],
    ['energyCost', scaled(spec.energyCost)],
    ['sleepHealing', scaled(spec.sleepHealing)],
    ['injuryNights', nights > 0 ? nights : undefined],
    ['bondGain', scaled(spec.bondGain)],
    ['checks', scaleRecord(spec.checks, strength)],
  ];
  const kept: ModifierSpec = Object.fromEntries(entries.filter(([, v]) => v !== undefined));
  return kept;
}

/**
 * An amount the dish gives as you eat it at this quality. Fullness is the dish's own (half of it
 * burnt); energy, health and chakra scale with the quality.
 */
export function amountAt(amount: number, quality: MealQuality, isFilling = false): number {
  if (isFilling) return quality === 'burnt' ? Math.round(amount * BURNT_FILLING) : amount;
  return Math.round(amount * QUALITY_STRENGTH[quality]);
}
