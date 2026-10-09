import type { RecipeDef } from '@/content';
import { describeSpec } from '@/systems/modifiers';
import { useUp } from '@/systems/inventory';
import type { JournalChip } from '@/systems/journal';

import type { GameContext } from '../context';
import { adjust, busyReason, chip, firstBlocker, log, spendTime } from '../ops';
import type { GameState } from '../state';
import { homeBlocker } from './daily';
import type { ActionHandler, ActionOf } from './types';

/** Cooking at home: cheaper than eating out, and a good meal sets you up for the day. */

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
  const cooked = {
    ...state,
    inventory: used.value,
    character: { ...state.character, meal: recipe.id },
  };
  const fed = adjust(spendTime(cooked, COOK_SLOTS, ctx), {
    satiety: recipe.satiety,
    energy: recipe.energy,
  });
  const chips = [
    chip(`Hunger −${recipe.satiety}`, 'gain'),
    ...(recipe.energy > 0 ? [chip(`Energy +${recipe.energy}`, 'gain')] : []),
    ...describeSpec(recipe.buff).map((e) => chip(e.label, 'gain')),
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
