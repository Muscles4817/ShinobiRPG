import type { IconId } from '@/content';
import { describeSpec, type EffectLine } from '@/systems/modifiers';
import { pantryCount } from '@/systems/inventory';

import { stageName, stageOf } from '@/systems/bonds';

import { dinnerBlocker, INVITE_STAGE } from '../actions/dinner';
import type { GameContext } from '../context';
import { bondOf, everyone } from '../people/cast';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/** The kitchen at home: what's in the pantry, what you can cook, and who could come to dinner. */

/** Someone you could have round for dinner with this recipe. */
export interface DinnerInvite extends Choice {
  readonly guestId: string;
  readonly name: string;
  /** Friendship stage, e.g. "Friend". */
  readonly stage: string;
  /** This recipe is their favourite. */
  readonly favourite: boolean;
}

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
  /** Why nobody can come round for it right now (evening only, twice the ingredients). */
  readonly inviteBlocker: string | null;
  /** Who could come round for it; empty while `inviteBlocker` applies. */
  readonly invites: readonly DinnerInvite[];
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
  /** Why nobody can be invited at all yet, or null. */
  readonly noGuests: string | null;
}

function guestsOf(state: GameState, ctx: GameContext) {
  return everyone(state, ctx)
    .map((person) => ({ person, points: bondOf(state, person.id).points }))
    .filter((g) => stageOf(g.points) >= INVITE_STAGE)
    .sort((a, b) => b.points - a.points);
}

export function kitchenView(state: GameState, ctx: GameContext): KitchenView {
  const { content } = ctx;
  const meal = state.character.meal ? content.recipes.get(state.character.meal) : undefined;
  const guests = guestsOf(state, ctx);
  return {
    pantry: content.ingredients.all
      .map((i) => ({
        id: i.id,
        name: i.name,
        icon: i.icon,
        count: pantryCount(state.inventory, i.id),
      }))
      .filter((i) => i.count > 0),
    recipes: content.recipes.all.map((r) => {
      const inviteBlocker = dinnerBlocker(state, ctx, r);
      return {
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
        inviteBlocker,
        invites:
          inviteBlocker === null
            ? guests.map(({ person, points }) => ({
                ...choice(state, ctx, { type: 'hostDinner', recipeId: r.id, guestId: person.id }),
                guestId: person.id,
                name: person.name,
                stage: stageName(stageOf(points)),
                favourite: person.favouriteRecipeId === r.id,
              }))
            : [],
      };
    }),
    meal: meal ? { name: meal.name, effects: describeSpec(meal.buff) } : null,
    noGuests:
      guests.length === 0 ? 'Get to know people first: friends will come round for dinner.' : null,
  };
}
