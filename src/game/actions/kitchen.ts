import type { RecipeDef } from '@/content';
import { cookedOnce, cookingGrade, knowsRecipe, withinReach } from '@/systems/cooking';
import { describeSpec } from '@/systems/modifiers';
import { useUp } from '@/systems/inventory';
import type { JournalChip } from '@/systems/journal';

import type { GameContext } from '../context';
import { adjust, busyReason, chip, firstBlocker, log, spendTime } from '../ops';
import type { GameState } from '../state';
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

/** What a meal gives as you eat it: fullness, energy, and for some dishes health or chakra. */
function eatingChips(recipe: RecipeDef): JournalChip[] {
  return [
    chip(`Hunger −${recipe.satiety}`, 'gain'),
    ...(recipe.energy > 0 ? [chip(`Energy +${recipe.energy}`, 'gain')] : []),
    ...(recipe.health ? [chip(`Health +${recipe.health}`, 'gain')] : []),
    ...(recipe.chakra ? [chip(`Chakra +${recipe.chakra}`, 'gain')] : []),
  ];
}

/** Cooks `servings` of a recipe and eats one: the pantry empties, the meal's buff starts. */
export function cookMeal(
  state: GameState,
  ctx: GameContext,
  recipe: RecipeDef,
  servings: number,
): { readonly state: GameState; readonly chips: JournalChip[] } {
  const used = useUp(
    state.inventory,
    recipe.ingredients.map((i) => ({ id: i.id, count: i.count * servings })),
  );
  if (!used.ok) return { state, chips: [] };
  const cooking = cookedOnce(state.cooking, recipe.id, recipe.rank);
  const cooked = {
    ...state,
    inventory: used.value,
    cooking,
    character: { ...state.character, meal: recipe.id },
  };
  const fed = adjust(spendTime(cooked, COOK_SLOTS, ctx), {
    satiety: recipe.satiety,
    energy: recipe.energy,
    health: recipe.health ?? 0,
    chakra: recipe.chakra ?? 0,
  });
  const before = cookingGrade(state.cooking.xp);
  const after = cookingGrade(cooking.xp);
  const chips = [
    ...eatingChips(recipe),
    ...describeSpec(recipe.buff).map((e) => chip(e.label, 'gain')),
    ...(after !== before ? [chip(`Cooking grade ${after}`, 'gain')] : []),
  ];
  return { state: fed, chips };
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
      missing && `${missing} The grocer sells them.`,
    );
  },
  perform(state, action, ctx) {
    const recipe = ctx.content.recipes.require(action.recipeId);
    const meal = cookMeal(state, ctx, recipe, 1);
    return log(meal.state, {
      heading: `Cooked ${recipe.name}`,
      text: recipe.description,
      tone: 'success',
      chips: meal.chips,
    });
  },
};
