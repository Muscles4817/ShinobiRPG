import type { IconId } from '@/content';
import { describeSpec, type EffectLine } from '@/systems/modifiers';
import { pantryCount } from '@/systems/inventory';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/** The kitchen at home: what's in the pantry and what you can cook from it. */

export interface RecipeCard extends Choice {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: IconId;
  readonly satiety: number;
  readonly energy: number;
  /** The day-long buff, worded by `describeSpec`. */
  readonly effects: readonly EffectLine[];
  readonly needs: readonly {
    readonly name: string;
    readonly have: number;
    readonly need: number;
  }[];
}

export interface KitchenView {
  readonly pantry: readonly {
    readonly id: string;
    readonly name: string;
    readonly icon: IconId;
    readonly count: number;
  }[];
  readonly recipes: readonly RecipeCard[];
  /** Today's meal and what it's doing for you, if you've cooked today. */
  readonly meal: { readonly name: string; readonly effects: readonly EffectLine[] } | null;
}

export function kitchenView(state: GameState, ctx: GameContext): KitchenView {
  const { content } = ctx;
  const meal = state.character.meal ? content.recipes.get(state.character.meal) : undefined;
  return {
    pantry: content.ingredients.all
      .map((i) => ({
        id: i.id,
        name: i.name,
        icon: i.icon,
        count: pantryCount(state.inventory, i.id),
      }))
      .filter((i) => i.count > 0),
    recipes: content.recipes.all.map((r) => ({
      ...choice(state, ctx, { type: 'cook', recipeId: r.id }),
      id: r.id,
      name: r.name,
      description: r.description,
      icon: r.icon,
      satiety: r.satiety,
      energy: r.energy,
      effects: describeSpec(r.buff),
      needs: r.ingredients.map((i) => ({
        name: content.ingredients.get(i.id)?.name ?? i.id,
        have: pantryCount(state.inventory, i.id),
        need: i.count,
      })),
    })),
    meal: meal ? { name: meal.name, effects: describeSpec(meal.buff) } : null,
  };
}
