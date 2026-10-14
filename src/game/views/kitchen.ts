import type { IconId, RecipeDef } from '@/content';
import { buffAt, cookingGrade, knowsRecipe, masteryOf, timesCooked } from '@/systems/cooking';
import { describeSpec, type EffectLine } from '@/systems/modifiers';
import { pantryCount } from '@/systems/inventory';
import type { StatGrade } from '@/systems/stats';
import type { CookingSteps } from '@/systems/cooking';

import { stageName, stageOf } from '@/systems/bonds';

import { dinnerBlocker, INVITE_STAGE } from '../actions/dinner';
import type { GameContext } from '../context';
import { bondOf, everyone } from '../people/cast';
import type { GameState } from '../state';
import { knownSteps } from '../stove';
import { mealProvisions } from '../combatants';
import { choice, type Choice } from './common';
import { provisionLine } from './provisions';
import { METHOD_WORDS, stepsHint } from './stove';

/** The kitchen at home: what's in the pantry, what you can cook, and who could come to dinner. */

const MASTERY_WORDS = { practised: 'Practised', mastered: 'Mastered' } as const;

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
  readonly rank: StatGrade;
  /** A snack sits beside the day's meal for a little while; a meal lasts the day. */
  readonly snack: boolean;
  /** How it's cooked, e.g. "Grilled": the method sets the right steps at the stove. */
  readonly method: string;
  /** What mastery has taught you of its steps, in words, or null. */
  readonly hint: string | null;
  /** The steps you already know, to set the stove for you. */
  readonly knownSteps: Partial<CookingSteps>;
  /** "Practised" or "Mastered" once you have cooked it enough, else null. */
  readonly mastery: string | null;
  readonly satiety: number;
  readonly energy: number;
  /** Health and chakra it gives back as you eat it (0 for most dishes). */
  readonly health: number;
  readonly chakra: number;
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
  /** The recipes you know; the cookbook shows the rest. */
  readonly recipes: readonly RecipeCard[];
  /** Your cooking grade, E–S. */
  readonly grade: StatGrade;
  /** Recipes you haven't learned yet. */
  readonly unlearned: number;
  /** Today's meal and what it's doing for you, if you've cooked today. */
  readonly meal: { readonly name: string; readonly effects: readonly EffectLine[] } | null;
  /** The snack still working, and what it's doing for you. */
  readonly snack: { readonly name: string; readonly effects: readonly EffectLine[] } | null;
  /** Why nobody can be invited at all yet, or null. */
  readonly noGuests: string | null;
}

function guestsOf(state: GameState, ctx: GameContext) {
  return everyone(state, ctx)
    .map((person) => ({ person, points: bondOf(state, person.id).points }))
    .filter((g) => stageOf(g.points) >= INVITE_STAGE)
    .sort((a, b) => b.points - a.points);
}

/** What today's meal is doing for you, at the quality it was cooked. */
function todaysMeal(state: GameState, ctx: GameContext, meal: RecipeDef): EffectLine[] {
  const quality = state.character.mealQuality ?? 'good';
  const provisions = mealProvisions(state, ctx);
  return [...describeSpec(buffAt(meal.buff, quality)), ...provisionLine(provisions[0])];
}

function snackNow(state: GameState, ctx: GameContext): KitchenView['snack'] {
  const { snack } = state.character;
  const recipe = snack ? ctx.content.recipes.get(snack.recipeId) : undefined;
  if (!snack || !recipe) return null;
  return { name: recipe.name, effects: describeSpec(buffAt(recipe.buff, snack.quality)) };
}

export function kitchenView(state: GameState, ctx: GameContext): KitchenView {
  const { content } = ctx;
  const meal = state.character.meal ? content.recipes.get(state.character.meal) : undefined;
  const guests = guestsOf(state, ctx);
  const known = content.recipes.all.filter((r) => knowsRecipe(state.cooking, r.id));
  return {
    grade: cookingGrade(state.cooking.xp),
    unlearned: content.recipes.all.length - known.length,
    pantry: content.ingredients.all
      .map((i) => ({
        id: i.id,
        name: i.name,
        icon: i.icon,
        count: pantryCount(state.inventory, i.id),
      }))
      .filter((i) => i.count > 0),
    recipes: known.map((r) => {
      const inviteBlocker = dinnerBlocker(state, ctx, r);
      const mastery = masteryOf(timesCooked(state.cooking, r.id));
      return {
        ...choice(state, ctx, { type: 'cook', recipeId: r.id }),
        id: r.id,
        name: r.name,
        description: r.description,
        icon: r.icon,
        rank: r.rank,
        snack: r.kind === 'snack',
        method: METHOD_WORDS[r.method],
        hint: stepsHint(knownSteps(state, r)),
        knownSteps: knownSteps(state, r),
        mastery: mastery === 'new' ? null : MASTERY_WORDS[mastery],
        satiety: r.satiety,
        energy: r.energy,
        health: r.health ?? 0,
        chakra: r.chakra ?? 0,
        effects: [...describeSpec(r.buff), ...provisionLine(r.provision)],
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
    meal: meal ? { name: meal.name, effects: todaysMeal(state, ctx, meal) } : null,
    snack: snackNow(state, ctx),
    noGuests:
      guests.length === 0 ? 'Get to know people first: friends will come round for dinner.' : null,
  };
}
