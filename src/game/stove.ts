import type { RecipeDef } from '@/content';
import {
  beatsLanded,
  CUTS,
  cookingGrade,
  FINISHES,
  HEATS,
  masteryOf,
  qualityOf,
  rightSteps,
  timesCooked,
  usualQuality,
  type Beat,
  type CookingSteps,
  type MealQuality,
} from '@/systems/cooking';
import { STAT_GRADES } from '@/systems/stats';

import type { GameState } from './state';

/**
 * The game's side of the stove: how a dish turns out when you cook it by hand (your three
 * beats against its right steps, nudged by your grade) or as usual, and what the cook learns
 * from it, beat by beat, without being told the answer.
 */

export interface StoveResult {
  readonly quality: MealQuality;
  /** One line per beat that missed, saying which way it went wrong. */
  readonly misses: readonly string[];
}

/** Your cooking grade against the dish's rank: above is a step in hand, below a step lost. */
function skillGap(state: GameState, recipe: RecipeDef): number {
  return STAT_GRADES.indexOf(cookingGrade(state.cooking.xp)) - STAT_GRADES.indexOf(recipe.rank);
}

const MISS_LINES: Readonly<Record<Beat, readonly [lower: string, higher: string]>> = {
  cut: ['You cut it finer than it wanted.', 'The pieces were too big for it.'],
  heat: ['The fire was too low for it.', 'The fire was too fierce for it.'],
  finish: ['You took it off too soon.', 'You left it on too long.'],
};

const ORDER: Readonly<Record<Beat, readonly string[]>> = {
  cut: CUTS,
  heat: HEATS,
  finish: FINISHES,
};

function missLine(beat: Beat, right: CookingSteps, tried: CookingSteps): string {
  const lower = ORDER[beat].indexOf(tried[beat]) < ORDER[beat].indexOf(right[beat]);
  return MISS_LINES[beat][lower ? 0 : 1];
}

/** Cooking by hand: how many beats landed decides the quality, and the misses say why. */
export function cookedByHand(
  state: GameState,
  recipe: RecipeDef,
  tried: CookingSteps,
): StoveResult {
  const right = rightSteps(recipe.method, recipe.steps);
  const landed = beatsLanded(right, tried);
  return {
    quality: qualityOf(landed.length, skillGap(state, recipe)),
    misses: (['cut', 'heat', 'finish'] as const)
      .filter((b) => !landed.includes(b))
      .map((b) => missLine(b, right, tried)),
  };
}

/** Cooking as usual: plain, or good once you've mastered the dish. */
export function cookedAsUsual(state: GameState, recipe: RecipeDef): StoveResult {
  const mastered = masteryOf(timesCooked(state.cooking, recipe.id)) === 'mastered';
  return { quality: usualQuality(mastered), misses: [] };
}

/** What you know of a dish's right steps: the heat once practised, everything once mastered. */
export function knownSteps(state: GameState, recipe: RecipeDef): Partial<CookingSteps> {
  const right = rightSteps(recipe.method, recipe.steps);
  switch (masteryOf(timesCooked(state.cooking, recipe.id))) {
    case 'new':
      return {};
    case 'practised':
      return { heat: right.heat };
    case 'mastered':
      return right;
  }
}
