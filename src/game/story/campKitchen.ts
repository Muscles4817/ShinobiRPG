import type { Rng } from '@/core';
import type { RecipeDef } from '@/content';
import { cookedOnce, drawFind, findsNow } from '@/systems/cooking';
import { stock, useUp } from '@/systems/inventory';
import type { MissionNote } from '@/systems/missions';
import { STAT_GRADES } from '@/systems/stats';

import type { GameContext } from '../context';
import { noteFinds } from '../fieldBook/record';
import { gatherMoment } from '../gathering';
import { adjust, chip, log } from '../ops';
import type { GameState } from '../state';
import { bondWithOne, crewPeople } from './personal';

/**
 * The camp's kitchen: forage around the camp for something to cook, and cook the best dish you
 * know for everyone from what you carry. A shared hot meal brings the crew closer.
 */

/** Energy a look around the camp costs. */
export const CAMP_FORAGE_ENERGY = 5;
/** The chance a look around the camp turns up a second thing. */
const SECOND_FIND_CHANCE = 0.5;
/** Bond with each of the crew for a hot meal cooked for everyone. */
export const CAMP_MEAL_BOND = 3;
/** Fullness from your own bowl at camp. */
export const CAMP_MEAL_SATIETY = 30;

export interface CampNotes {
  readonly state: GameState;
  readonly notes: readonly MissionNote[];
}

/** One or two things from around the camp, by season, hour and what you'd know for food. */
export function forageCamp(state: GameState, ctx: GameContext, rng: Rng): CampNotes {
  const finds = findsNow(ctx.content.campFinds, gatherMoment(state));
  const count = rng.chance(SECOND_FIND_CHANCE) ? 2 : 1;
  const ids = Array.from({ length: count }, () => rng.next()).flatMap(
    (roll) => drawFind(finds, roll)?.ingredientId ?? [],
  );
  if (ids.length === 0) {
    const text = 'You poke around the camp in the dark and come back empty-handed.';
    return { state, notes: [{ kind: 'story', text }] };
  }
  const inventory = ids.reduce((inv, id) => stock(inv, id), state.inventory);
  const text = 'You look along the verge and down by the water, and find something for the pot.';
  const found = adjust({ ...noteFinds(state, ids), inventory }, { energy: -CAMP_FORAGE_ENERGY });
  const logged = log(found, {
    text,
    tone: 'success',
    chips: [
      ...ids.map((id) => chip(ctx.content.ingredients.require(id).name, 'gain')),
      chip(`−${CAMP_FORAGE_ENERGY} energy`, 'cost'),
    ],
  });
  return { state: logged, notes: [{ kind: 'story', text }] };
}

/** The best dish you know that the pack can cover for everyone at the fire. */
function campDish(state: GameState, ctx: GameContext, servings: number): RecipeDef | undefined {
  const pantry = state.inventory.pantry;
  return ctx.content.recipes.all
    .filter((r) => r.kind !== 'snack' && state.cooking.known[r.id] !== undefined)
    .filter((r) => r.ingredients.every((i) => (pantry[i.id] ?? 0) >= i.count * servings))
    .sort((a, b) => STAT_GRADES.indexOf(b.rank) - STAT_GRADES.indexOf(a.rank))[0];
}

/** A hot meal for everyone: bond with each of the crew, and practice at the dish. */
export function cookForCamp(state: GameState, ctx: GameContext): CampNotes {
  const crew = crewPeople(state, ctx);
  const servings = crew.length + 1;
  const dish = campDish(state, ctx, servings);
  if (!dish) {
    const text = 'There’s nothing in your pack to make a meal of for everyone.';
    return { state, notes: [{ kind: 'story', text }] };
  }
  const used = useUp(
    state.inventory,
    dish.ingredients.map((i) => ({ id: i.id, count: i.count * servings })),
  );
  if (!used.ok) return { state, notes: [] };
  const fed = adjust(
    {
      ...state,
      inventory: used.value,
      cooking: cookedOnce(state.cooking, dish.id, dish.rank),
    },
    { satiety: CAMP_MEAL_SATIETY },
  );
  const closer = crew.reduce((s, p) => bondWithOne(s, p.id, CAMP_MEAL_BOND), fed);
  const text = `You cook ${dish.name} over the fire, and everyone eats it out of the pot.`;
  const logged = log(closer, {
    text,
    tone: 'success',
    chips: [
      chip(`Hunger −${CAMP_MEAL_SATIETY}`, 'gain'),
      ...crew.map((p) => chip(`+${CAMP_MEAL_BOND} bond with ${p.name}`, 'gain')),
    ],
  });
  return { state: logged, notes: [{ kind: 'story', text }] };
}
