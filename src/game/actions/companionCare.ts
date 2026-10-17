import {
  laidUp,
  MEAL_BOND,
  MEDICINE_DAYS,
  playBond,
  withBond,
  type Companion,
  type MealKind,
} from '@/systems/companions';
import { pantryCount, useUp } from '@/systems/inventory';

import { favouriteOf, warmed, withCompanion, yourCompanion } from '../companions/care';
import type { GameContext } from '../context';
import { adjust, busyReason, chip, firstBlocker, log } from '../ops';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/**
 * Daily care, wherever your companion is with you: a meal (free scraps, plain food from the
 * pantry, or its favourite), a game by its tastes, and medicine for an injury, hidden in food
 * or given plainly. One meal and one game a day; one dose a day.
 */

const NO_COMPANION = 'You have no companion.';
/** Energy a game takes out of you. */
export const PLAY_ENERGY = 5;
/** A dose given plainly is spat out this often, and it minds. */
const SPIT_CHANCE = 0.4;
const SPIT_BOND = -2;

function mealOf(state: GameState, ctx: GameContext, ingredientId: string | null): MealKind {
  const yours = yourCompanion(state, ctx);
  if (!yours || ingredientId === null) return 'scraps';
  return favouriteOf(yours.companion, yours.kind, state.board.seed) === ingredientId
    ? 'favourite'
    : 'plain';
}

export const feedCompanion: ActionHandler<ActionOf<'feedCompanion'>> = {
  check(state, { ingredientId }, ctx) {
    const yours = yourCompanion(state, ctx);
    if (!yours) return NO_COMPANION;
    const { companion, kind } = yours;
    return firstBlocker(
      busyReason(state),
      companion.lastFedDay === state.time.day && `${companion.name} has eaten today.`,
      ingredientId !== null &&
        !kind.diet.includes(ingredientId) &&
        `${companion.name} won’t eat that.`,
      ingredientId !== null &&
        pantryCount(state.inventory, ingredientId) < 1 &&
        'There is none in your pantry.',
    );
  },
  perform(state, { ingredientId }, ctx) {
    const yours = yourCompanion(state, ctx);
    if (!yours) return state;
    const meal = mealOf(state, ctx, ingredientId);
    const used = ingredientId ? useUp(state.inventory, [{ id: ingredientId, count: 1 }]) : null;
    const inventory = used?.ok ? used.value : state.inventory;
    const fed: Companion = {
      ...warmed(yours.companion, yours.kind, MEAL_BOND[meal]),
      lastFedDay: state.time.day,
      favouriteKnown: yours.companion.favouriteKnown || meal === 'favourite',
    };
    const food = ingredientId ? ctx.content.ingredients.require(ingredientId).name : 'scraps';
    return log(withCompanion({ ...state, inventory }, fed), {
      text: mealLine(fed.name, meal, food.toLowerCase(), yours.companion.favouriteKnown),
      tone: meal === 'favourite' ? 'success' : 'info',
      chips: fed.bond > yours.companion.bond ? [chip('Bond up', 'gain')] : [],
    });
  },
};

function mealLine(name: string, meal: MealKind, food: string, known: boolean): string {
  switch (meal) {
    case 'scraps':
      return `${name} eats the scraps from your table and looks up for more.`;
    case 'plain':
      return `${name} eats the ${food}, tail going.`;
    case 'favourite':
      return known
        ? `${name} wolfs down the ${food}. Still a favourite.`
        : `${name} wolfs down the ${food} and begs for more. A favourite, then.`;
  }
}

export const playWithCompanion: ActionHandler<ActionOf<'playWithCompanion'>> = {
  check(state, _action, ctx) {
    const yours = yourCompanion(state, ctx);
    if (!yours) return NO_COMPANION;
    const { companion } = yours;
    return firstBlocker(
      busyReason(state),
      laidUp(companion, state.time.day) && `${companion.name} is laid up. Let it rest.`,
      companion.lastPlayDay === state.time.day && `You’ve played with ${companion.name} today.`,
      state.character.vitals.energy < PLAY_ENERGY && `Needs ${PLAY_ENERGY} energy.`,
    );
  },
  perform(state, { play }, ctx) {
    const yours = yourCompanion(state, ctx);
    if (!yours) return state;
    const base = playBond(play, yours.kind.plays);
    const played = { ...warmed(yours.companion, yours.kind, base), lastPlayDay: state.time.day };
    const loved = yours.kind.plays.likes.includes(play);
    const sulked = yours.kind.plays.dislikes.includes(play);
    const text = loved
      ? `${played.name} can’t get enough of it.`
      : sulked
        ? `${played.name} goes along with it, without much joy.`
        : `${played.name} plays happily until you both flag.`;
    return log(adjust(withCompanion(state, played), { energy: -PLAY_ENERGY }), {
      text,
      tone: loved ? 'success' : 'info',
      chips: [chip(`−${PLAY_ENERGY} energy`, 'cost')],
    });
  },
};

/** The cheapest food it eats that you have, to hide a dose in. */
function foodToHideIn(state: GameState, ctx: GameContext): string | null {
  const yours = yourCompanion(state, ctx);
  const have = (yours?.kind.diet ?? []).filter((id) => pantryCount(state.inventory, id) > 0);
  return (
    [...have].sort(
      (a, b) => ctx.content.ingredients.require(a).cost - ctx.content.ingredients.require(b).cost,
    )[0] ?? null
  );
}

export const doseCompanion: ActionHandler<ActionOf<'doseCompanion'>> = {
  check(state, { hidden }, ctx) {
    const yours = yourCompanion(state, ctx);
    if (!yours) return NO_COMPANION;
    const { companion } = yours;
    return firstBlocker(
      busyReason(state),
      !laidUp(companion, state.time.day) && `${companion.name} isn’t hurt.`,
      state.companions.medicine < 1 && 'You have no medicine. The vet sells it.',
      companion.injury?.dosedDay === state.time.day && 'One dose a day is enough.',
      hidden && foodToHideIn(state, ctx) === null && 'You have nothing it eats to hide it in.',
    );
  },
  perform(state, { hidden }, ctx, rng) {
    const yours = yourCompanion(state, ctx);
    const injury = yours?.companion.injury;
    if (!yours || !injury) return state;
    const food = hidden ? foodToHideIn(state, ctx) : null;
    const used = food ? useUp(state.inventory, [{ id: food, count: 1 }]) : null;
    const inventory = used?.ok ? used.value : state.inventory;
    const companions = { ...state.companions, medicine: state.companions.medicine - 1 };
    const spat = !hidden && rng.chance(SPIT_CHANCE);
    const until = spat ? injury.until : injury.until - MEDICINE_DAYS;
    const dosed = { ...yours.companion, injury: { ...injury, until, dosedDay: state.time.day } };
    const after = spat ? withBond(dosed, SPIT_BOND) : dosed;
    const text = spat
      ? `${after.name} spits the dose into the dust and won’t look at you.`
      : `${after.name} takes the dose${hidden ? ' without noticing' : ', grudgingly'}. It will mend sooner.`;
    return log(withCompanion({ ...state, inventory, companions }, after), {
      text,
      tone: spat ? 'warning' : 'success',
    });
  },
};
