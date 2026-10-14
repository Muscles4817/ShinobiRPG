import type { CookbookDef, PersonDef, RecipeLesson } from '@/content';
import { stageForPair, stageOf } from '@/systems/bonds';
import { knowsRecipe, learnRecipes } from '@/systems/cooking';
import { spend } from '@/systems/wallet';

import type { GameContext } from '../context';
import { busyReason, chip, firstBlocker, log, spendTime } from '../ops';
import { bondOf, findPerson, requirePerson, whereNow } from '../people/cast';
import type { GameState } from '../state';
import { closedReason, isOpen, marketPrice, stallsHere } from '../village';
import type { ActionHandler, ActionOf } from './types';

/**
 * Learning recipes: a cookbook from the grocer teaches every dish in it at once, and people who
 * cook for a living teach theirs one at a time, in order, once you are close enough.
 */

const LESSON_SLOTS = 1;

function bookstallFor(state: GameState, ctx: GameContext, cookbookId: string) {
  const stalls = stallsHere(state, ctx).filter((s) => s.cookbookIds?.includes(cookbookId));
  return stalls.find((s) => isOpen(s.hours, state)) ?? stalls[0];
}

/** The recipes in a book you don't know yet. */
export function newInBook(state: GameState, book: CookbookDef): readonly string[] {
  return book.recipeIds.filter((id) => !knowsRecipe(state.cooking, id));
}

export const buyCookbook: ActionHandler<ActionOf<'buyCookbook'>> = {
  check(state, action, ctx) {
    const book = ctx.content.cookbooks.get(action.cookbookId);
    const stall = book && bookstallFor(state, ctx, book.id);
    if (!book || !stall) return 'That isn’t sold here.';
    const cost = marketPrice(book.cost, state, ctx);
    return firstBlocker(
      busyReason(state),
      closedReason(stall.name, stall.hours, state),
      newInBook(state, book).length === 0 && 'You already know every recipe in it.',
      state.wallet.ryo < cost && `You can’t afford it (${cost} ryo).`,
    );
  },
  perform(state, action, ctx) {
    const book = ctx.content.cookbooks.require(action.cookbookId);
    const cost = marketPrice(book.cost, state, ctx);
    const paid = spend(state.wallet, cost);
    if (!paid.ok) return state;
    const fresh = newInBook(state, book);
    const names = fresh.map((id) => ctx.content.recipes.require(id).name);
    return log(
      { ...state, wallet: paid.value, cooking: learnRecipes(state.cooking, fresh) },
      {
        heading: book.name,
        text: `${book.description} You read it cover to cover on the walk home.`,
        tone: 'success',
        chips: [...names.map((n) => chip(`Learned ${n}`, 'gain')), chip(`−${cost} ryo`, 'cost')],
      },
    );
  },
};

/** The next recipe someone teaches that you don't know yet, if any. */
export function nextLesson(state: GameState, person: PersonDef): RecipeLesson | null {
  return (person.recipes ?? []).find((l) => !knowsRecipe(state.cooking, l.recipeId)) ?? null;
}

/** Why this person won't teach you their next recipe now (closeness, or not around), or null. */
export function lessonBlocker(
  state: GameState,
  ctx: GameContext,
  person: PersonDef,
): string | null {
  const lesson = nextLesson(state, person);
  if (!lesson) return `${person.name} has taught you everything they cook.`;
  return firstBlocker(
    busyReason(state),
    whereNow(state, ctx, person) === null && `${person.name} isn’t around right now.`,
    stageOf(bondOf(state, person.id).points) < lesson.minStage &&
      `${person.name} will show you once you are ${stageForPair(lesson.minStage)}.`,
  );
}

export const learnRecipe: ActionHandler<ActionOf<'learnRecipe'>> = {
  check(state, action, ctx) {
    const person = findPerson(state, ctx, action.personId);
    if (!person?.recipes?.length) return 'They don’t teach cooking.';
    return lessonBlocker(state, ctx, person);
  },
  perform(state, action, ctx) {
    const person = requirePerson(state, ctx, action.personId);
    const lesson = nextLesson(state, person);
    if (!lesson) return state;
    const recipe = ctx.content.recipes.require(lesson.recipeId);
    const taught = { ...state, cooking: learnRecipes(state.cooking, [recipe.id]) };
    return log(spendTime(taught, LESSON_SLOTS, ctx), {
      heading: `${person.name} teaches you ${recipe.name}`,
      text: `${person.name} pushes a knife into your hand and talks you through it, slapping your wrist when you rush. ${recipe.description}`,
      tone: 'success',
      chips: [chip(`Learned ${recipe.name}`, 'gain')],
    });
  },
};
