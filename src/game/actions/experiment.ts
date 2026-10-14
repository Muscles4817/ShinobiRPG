import {
  learnRecipes,
  MAX_EXPERIMENT_INGREDIENTS,
  MIN_EXPERIMENT_INGREDIENTS,
  tryCombination,
  withinReach,
  cookingGrade,
  type ExperimentResult,
} from '@/systems/cooking';
import { useUp } from '@/systems/inventory';
import type { JournalChip } from '@/systems/journal';

import type { GameContext } from '../context';
import { adjust, busyReason, chip, firstBlocker, log, spendTime } from '../ops';
import type { GameState } from '../state';
import { homeBlocker } from './daily';
import { cookMeal } from './kitchen';
import type { ActionHandler, ActionOf } from './types';

/**
 * Trying something new at the stove: one of each chosen ingredient goes in the pot. The same
 * set as a dish you don't know (and could cook) teaches it and you eat it, plain; anything else
 * is a filling something, and the pot hints at how close you came.
 */

const EXPERIMENT_SLOTS = 1;
/** Fullness from each ingredient in a pot that came to nothing. */
const SATIETY_PER_INGREDIENT = 10;

const HINTS: Readonly<Record<Exclude<ExperimentResult['kind'], 'found'>, string>> = {
  close: 'It isn’t a dish yet, but it’s the start of one. It wants something more.',
  warm: 'Some of it belongs together. Some of it really doesn’t.',
  nothing: 'Nothing comes of it but a filling, shapeless stew.',
};

/** Dishes you could discover now: unknown, and within reach of your grade. */
function discoverable(state: GameState, ctx: GameContext) {
  const grade = cookingGrade(state.cooking.xp);
  return ctx.content.recipes.all
    .filter((r) => state.cooking.known[r.id] === undefined && withinReach(grade, r.rank))
    .map((r) => ({ id: r.id, ingredientIds: r.ingredients.map((i) => i.id) }));
}

function experimentBlocker(state: GameState, ids: readonly string[]): string | null {
  const distinct = new Set(ids);
  if (distinct.size !== ids.length) return 'Each ingredient goes in once.';
  if (ids.length < MIN_EXPERIMENT_INGREDIENTS) return 'Put at least two things together.';
  if (ids.length > MAX_EXPERIMENT_INGREDIENTS) return 'Four things is plenty for one pot.';
  return ids.every((id) => (state.inventory.pantry[id] ?? 0) > 0)
    ? null
    : 'You don’t have all of that in the pantry.';
}

export const experiment: ActionHandler<ActionOf<'experiment'>> = {
  check(state, action, ctx) {
    return firstBlocker(
      busyReason(state),
      homeBlocker(state, ctx),
      experimentBlocker(state, action.ingredientIds),
    );
  },
  perform(state, action, ctx) {
    const result = tryCombination(action.ingredientIds, discoverable(state, ctx));
    if (result.kind === 'found') {
      const recipe = ctx.content.recipes.require(result.recipeId);
      const learned = { ...state, cooking: learnRecipes(state.cooking, [recipe.id]) };
      // The pot needs the dish's full measure; with less, you learn it but eat what you made.
      const meal = cookMeal(learned, ctx, recipe, { servings: 1, quality: 'plain' });
      if (meal.state !== learned) {
        return log(meal.state, {
          heading: `You worked out ${recipe.name}`,
          text: `It comes together in the pot, and you know what it is. ${recipe.description}`,
          tone: 'success',
          chips: [chip(`Learned ${recipe.name}`, 'gain'), ...meal.chips],
        });
      }
      return potOfSomething(learned, ctx, action.ingredientIds, {
        text: `It nearly comes together, and you see what it could be: ${recipe.name}. A full dish needs more of it.`,
        chips: [chip(`Learned ${recipe.name}`, 'gain')],
      });
    }
    return potOfSomething(state, ctx, action.ingredientIds, {
      text: HINTS[result.kind],
      chips: [],
    });
  },
};

/** One of each ingredient into a pot that isn't a known dish: it fills you, and that's all. */
function potOfSomething(
  state: GameState,
  ctx: GameContext,
  ids: readonly string[],
  story: { readonly text: string; readonly chips: readonly JournalChip[] },
): GameState {
  const used = useUp(
    state.inventory,
    ids.map((id) => ({ id, count: 1 })),
  );
  if (!used.ok) return state;
  const satiety = SATIETY_PER_INGREDIENT * ids.length;
  const fed = adjust(spendTime({ ...state, inventory: used.value }, EXPERIMENT_SLOTS, ctx), {
    satiety,
  });
  return log(fed, {
    heading: 'Something new in the pot',
    text: story.text,
    tone: 'info',
    chips: [...story.chips, chip(`Hunger −${satiety}`, 'gain')],
  });
}
