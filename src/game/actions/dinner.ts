import { recordMeeting, stageName, stageOf, talkedToday } from '@/systems/bonds';
import { TIME_SLOTS } from '@/systems/time';

import type { RecipeDef } from '@/content';

import type { GameContext } from '../context';
import { busyReason, chip, firstBlocker, log } from '../ops';
import { bondOf, findPerson, whereNow } from '../people/cast';
import type { GameState } from '../state';
import { festivalBondBonus } from '../village';
import { homeBlocker } from './daily';
import { cookMeal, missingFor } from './kitchen';
import type { ActionHandler, ActionOf } from './types';

/**
 * Dinner invites: cook for two in the evening and have someone over. It counts as your time
 * together today and is worth more than a chat, more again if you cook their favourite.
 */

const DINNER_SLOT = TIME_SLOTS.indexOf('evening');
/** Only people you already know come round. */
export const INVITE_STAGE = 1;
const DINNER_BOND = 6;
const FAVOURITE_BONUS = 6;
const SERVINGS = 2;

/** Why you can't have anyone round for this recipe right now, whoever they are. */
export function dinnerBlocker(
  state: GameState,
  ctx: GameContext,
  recipe: RecipeDef,
): string | null {
  const missing = missingFor(state, ctx, recipe, SERVINGS);
  return firstBlocker(
    busyReason(state),
    homeBlocker(state, ctx),
    state.time.slot !== DINNER_SLOT && 'Guests come round in the evening.',
    missing && `Cooking for two. ${missing}`,
  );
}

export const hostDinner: ActionHandler<ActionOf<'hostDinner'>> = {
  check(state, action, ctx) {
    const recipe = ctx.content.recipes.get(action.recipeId);
    const guest = findPerson(state, ctx, action.guestId);
    if (!recipe || !guest) return 'You can’t cook that for them.';
    const bond = bondOf(state, guest.id);
    return firstBlocker(
      dinnerBlocker(state, ctx, recipe),
      stageOf(bond.points) < INVITE_STAGE && `You don’t know ${guest.name} well enough yet.`,
      talkedToday(bond, state.time.day) && `You’ve already spent time with ${guest.name} today.`,
      whereNow(state, ctx, guest) === null && `${guest.name} is away this evening.`,
    );
  },
  perform(state, action, ctx) {
    const recipe = ctx.content.recipes.require(action.recipeId);
    const guest = findPerson(state, ctx, action.guestId);
    if (!guest) return state;
    const favourite = guest.favouriteRecipeId === recipe.id;
    const delta = DINNER_BOND + (favourite ? FAVOURITE_BONUS : 0) + festivalBondBonus(state, ctx);
    const before = bondOf(state, guest.id);
    const after = recordMeeting(before, { day: state.time.day, delta });
    const meal = cookMeal(state, ctx, recipe, SERVINGS);
    const newStage = stageOf(after.points) > stageOf(before.points);
    const hosted = {
      ...meal.state,
      people: {
        ...meal.state.people,
        bonds: { ...meal.state.people.bonds, [guest.id]: after },
      },
    };
    return log(hosted, {
      heading: `Dinner with ${guest.name}`,
      text: favourite
        ? `${guest.name} lights up at the first smell of ${recipe.name}. It’s their favourite. You talk until the lanterns burn low.`
        : `${guest.name} comes round for ${recipe.name}. You talk until the lanterns burn low.`,
      tone: 'success',
      chips: [
        chip(`${guest.name} +${delta}`, 'gain'),
        ...(newStage ? [chip(stageName(stageOf(after.points)), 'gain')] : []),
        ...meal.chips,
      ],
    });
  },
};
