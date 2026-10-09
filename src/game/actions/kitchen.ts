import { describeSpec } from '@/systems/modifiers';
import { useUp } from '@/systems/inventory';

import { adjust, busyReason, chip, firstBlocker, log, spendTime } from '../ops';
import { homeBlocker } from './daily';
import type { ActionHandler, ActionOf } from './types';

/** Cooking at home: cheaper than eating out, and a good meal sets you up for the day. */

const COOK_SLOTS = 1;

export const cook: ActionHandler<ActionOf<'cook'>> = {
  check(state, action, ctx) {
    const recipe = ctx.content.recipes.get(action.recipeId);
    if (!recipe) return 'You don’t know that recipe.';
    const missing = recipe.ingredients
      .filter((i) => (state.inventory.pantry[i.id] ?? 0) < i.count)
      .map((i) => ctx.content.ingredients.get(i.id)?.name ?? i.id);
    return firstBlocker(
      busyReason(state),
      homeBlocker(state, ctx),
      missing.length > 0 && `Needs ${missing.join(', ')}. The grocer sells them.`,
    );
  },
  perform(state, action, ctx) {
    const recipe = ctx.content.recipes.require(action.recipeId);
    const used = useUp(state.inventory, recipe.ingredients);
    if (!used.ok) return state;
    const cooked = {
      ...state,
      inventory: used.value,
      character: { ...state.character, meal: recipe.id },
    };
    const fed = adjust(spendTime(cooked, COOK_SLOTS, ctx), {
      satiety: recipe.satiety,
      energy: recipe.energy,
    });
    const effects = describeSpec(recipe.buff).map((e) => chip(e.label, 'gain'));
    return log(fed, {
      heading: `Cooked ${recipe.name}`,
      text: recipe.description,
      tone: 'success',
      chips: [
        chip(`Fed +${recipe.satiety}`, 'gain'),
        ...(recipe.energy > 0 ? [chip(`Energy +${recipe.energy}`, 'gain')] : []),
        ...effects,
      ],
    });
  },
};
