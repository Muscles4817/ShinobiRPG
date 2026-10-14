import type { RecipeDef } from '@/content';
import {
  amountAt,
  buffAt,
  cookedOnce,
  cookingGrade,
  CUTS,
  FINISHES,
  HEATS,
  knowsRecipe,
  withinReach,
  type CookingSteps,
  type MealQuality,
} from '@/systems/cooking';
import { describeSpec } from '@/systems/modifiers';
import { useUp } from '@/systems/inventory';
import type { JournalChip } from '@/systems/journal';

import type { GameContext } from '../context';
import { adjust, busyReason, chip, firstBlocker, log, spendTime } from '../ops';
import type { GameState } from '../state';
import { snackFrom } from '../snacks';
import { cookedAsUsual, cookedByHand, type StoveResult } from '../stove';
import { homeBlocker } from './daily';
import type { ActionHandler, ActionOf } from './types';

/**
 * Cooking at home: cheaper than eating out, and a good meal sets you up for the day. You cook
 * only what you've learned, up to one rank above your cooking grade, and every dish cooked
 * adds to your grade and to your hand with that recipe.
 */

const COOK_SLOTS = 1;

/** "Needs Miso, Vegetables." when the pantry can't cover `servings` of the recipe, else null. */
export function missingFor(
  state: GameState,
  ctx: GameContext,
  recipe: RecipeDef,
  servings: number,
): string | null {
  const missing = recipe.ingredients
    .filter((i) => (state.inventory.pantry[i.id] ?? 0) < i.count * servings)
    .map((i) => ctx.content.ingredients.get(i.id)?.name ?? i.id);
  return missing.length > 0 ? `Needs ${missing.join(', ')}.` : null;
}

/** Why you can't cook this recipe at all yet (unknown, or beyond your grade), or null. */
export function recipeBlocker(state: GameState, recipe: RecipeDef): string | null {
  if (!knowsRecipe(state.cooking, recipe.id)) return 'You haven’t learned this recipe.';
  const grade = cookingGrade(state.cooking.xp);
  return withinReach(grade, recipe.rank)
    ? null
    : `A rank ${recipe.rank} dish is beyond a grade ${grade} cook. Cook simpler dishes first.`;
}

/** What a meal gives as you eat it at this quality: fullness, energy, health, chakra. */
function eatingChips(recipe: RecipeDef, quality: MealQuality): JournalChip[] {
  const energy = amountAt(recipe.energy, quality);
  const health = amountAt(recipe.health ?? 0, quality);
  const chakra = amountAt(recipe.chakra ?? 0, quality);
  return [
    chip(`Hunger −${amountAt(recipe.satiety, quality, true)}`, 'gain'),
    ...(energy > 0 ? [chip(`Energy +${energy}`, 'gain')] : []),
    ...(health > 0 ? [chip(`Health +${health}`, 'gain')] : []),
    ...(chakra > 0 ? [chip(`Chakra +${chakra}`, 'gain')] : []),
  ];
}

const QUALITY_WORDS: Readonly<Record<MealQuality, string>> = {
  burnt: 'Burnt',
  plain: 'Plain',
  good: 'Good',
  fine: 'Fine',
};

/** How many servings to cook and how well they turned out. */
export interface Serving {
  readonly servings: number;
  readonly quality: MealQuality;
}

/** Cooks servings of a recipe and eats one: the pantry empties, the meal's buff starts. */
export function cookMeal(
  state: GameState,
  ctx: GameContext,
  recipe: RecipeDef,
  serving: Serving,
): { readonly state: GameState; readonly chips: JournalChip[] } {
  const { servings, quality } = serving;
  const used = useUp(
    state.inventory,
    recipe.ingredients.map((i) => ({ id: i.id, count: i.count * servings })),
  );
  if (!used.ok) return { state, chips: [] };
  const cooking = cookedOnce(state.cooking, recipe.id, recipe.rank);
  const character =
    recipe.kind === 'snack'
      ? { ...state.character, snack: snackFrom(recipe.id, quality, state.time) }
      : { ...state.character, meal: recipe.id, mealQuality: quality };
  const cooked = { ...state, inventory: used.value, cooking, character };
  const fed = adjust(spendTime(cooked, COOK_SLOTS, ctx), {
    satiety: amountAt(recipe.satiety, quality, true),
    energy: amountAt(recipe.energy, quality),
    health: amountAt(recipe.health ?? 0, quality),
    chakra: amountAt(recipe.chakra ?? 0, quality),
  });
  const before = cookingGrade(state.cooking.xp);
  const after = cookingGrade(cooking.xp);
  const chips = [
    chip(QUALITY_WORDS[quality], quality === 'burnt' ? 'cost' : 'gain'),
    ...eatingChips(recipe, quality),
    ...describeSpec(buffAt(recipe.buff, quality)).map((e) => chip(e.label, e.tone)),
    ...(after !== before ? [chip(`Cooking grade ${after}`, 'gain')] : []),
  ];
  return { state: fed, chips };
}

/** Why these steps can't be cooked (not one of the stove's choices), or null. */
function stepsBlocker(steps: CookingSteps | undefined): string | null {
  if (!steps) return null;
  const valid =
    CUTS.includes(steps.cut) && HEATS.includes(steps.heat) && FINISHES.includes(steps.finish);
  return valid ? null : 'That isn’t a way to cook.';
}

/** The story line for a dish: its description, then what went wrong at the stove. */
function cookLine(recipe: RecipeDef, result: StoveResult): string {
  if (result.quality === 'burnt') return `${result.misses.join(' ')} It is edible. Just.`;
  if (result.misses.length === 0) return recipe.description;
  return `${recipe.description} ${result.misses.join(' ')}`;
}

export const cook: ActionHandler<ActionOf<'cook'>> = {
  check(state, action, ctx) {
    const recipe = ctx.content.recipes.get(action.recipeId);
    if (!recipe) return 'You don’t know that recipe.';
    const missing = missingFor(state, ctx, recipe, 1);
    return firstBlocker(
      busyReason(state),
      homeBlocker(state, ctx),
      recipeBlocker(state, recipe),
      stepsBlocker(action.steps),
      missing && `${missing} The grocer sells them.`,
    );
  },
  perform(state, action, ctx) {
    const recipe = ctx.content.recipes.require(action.recipeId);
    const result = action.steps
      ? cookedByHand(state, recipe, action.steps)
      : cookedAsUsual(state, recipe);
    const meal = cookMeal(state, ctx, recipe, { servings: 1, quality: result.quality });
    return log(meal.state, {
      heading: `Cooked ${recipe.name}`,
      text: cookLine(recipe, result),
      tone: result.quality === 'burnt' ? 'warning' : 'success',
      chips: meal.chips,
    });
  },
};
