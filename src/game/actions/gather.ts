import type { Rng } from '@/core';
import { drawFind, gatheredToday, type Find } from '@/systems/cooking';
import { stock } from '@/systems/inventory';
import type { JournalChip } from '@/systems/journal';
import { rollCheck } from '@/systems/stats';

import type { GameContext } from '../context';
import { landCatch, newEntryChips, noteFinds } from '../fieldBook/record';
import { findsHereNow, spotKey, wildsHere } from '../gathering';
import { weakFromHunger } from '../hunger';
import { laidUp } from '../injuries';
import { adjust, busyReason, chip, firstBlocker, log, spendTime } from '../ops';
import { hardWorkEnergy } from '../profile';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/**
 * Gathering: forage a wild place for what's in season, or cast a line at one of its spots for
 * what bites at this hour. Each place and each spot gives once a day. A sharp eye (perception)
 * finds a second handful; patience (willpower) decides whether anything bites.
 */

const GATHER_SLOTS = 1;
const FORAGE_ENERGY = 10;
const FISH_ENERGY = 5;
/** Perception against this finds a second handful while foraging. */
const SHARP_EYE_DIFFICULTY = 12;
/** Willpower against this lands a fish. */
const PATIENCE_DIFFICULTY = 8;

function draws(finds: readonly Find[], count: number, rng: Rng): string[] {
  return Array.from({ length: count }, () => drawFind(finds, rng.next())?.ingredientId).filter(
    (id): id is string => id !== undefined,
  );
}

/** Puts what you gathered in the pantry, remembers the day, and spends the time and energy. */
function bring(
  state: GameState,
  ctx: GameContext,
  haul: { readonly key: string; readonly ids: readonly string[]; readonly energy: number },
): GameState {
  const inventory = haul.ids.reduce((inv, id) => stock(inv, id), state.inventory);
  const cooking = {
    ...state.cooking,
    gathered: { ...state.cooking.gathered, [haul.key]: state.time.day },
  };
  return adjust(spendTime({ ...state, inventory, cooking }, GATHER_SLOTS, ctx), {
    energy: -haul.energy,
  });
}

/** What came home, then what the field book made of it (a length, a new entry), then the energy. */
function haulChips(
  ctx: GameContext,
  haul: { readonly ids: readonly string[]; readonly energy: number },
  noted: readonly JournalChip[] = [],
) {
  const { ids, energy } = haul;
  return [
    ...ids.map((id) => chip(ctx.content.ingredients.require(id).name, 'gain')),
    ...noted,
    chip(`−${energy} energy`, 'cost'),
  ];
}

function hardWorkBlockers(state: GameState, ctx: GameContext, energy: number) {
  return firstBlocker(
    busyReason(state),
    weakFromHunger(state),
    laidUp(state, ctx),
    state.character.vitals.energy < energy && `Needs ${energy} energy. Nap or eat first.`,
  );
}

export const forage: ActionHandler<ActionOf<'forage'>> = {
  check(state, action, ctx) {
    const place = wildsHere(state, ctx, action.placeId);
    if (!place) return 'There’s nowhere like that here.';
    return firstBlocker(
      hardWorkBlockers(state, ctx, hardWorkEnergy(state.character, ctx, FORAGE_ENERGY)),
      gatheredToday(state.cooking.gathered, place.id, state.time.day) &&
        `You’ve already searched ${place.name} today.`,
      findsHereNow(state, place.finds).length === 0 && 'Nothing you know grows here now.',
    );
  },
  perform(state, action, ctx, rng) {
    const place = wildsHere(state, ctx, action.placeId);
    if (!place) return state;
    const sharp = rollCheck(state.character.stats.perception, SHARP_EYE_DIFFICULTY, rng).success;
    const ids = draws(findsHereNow(state, place.finds), sharp ? 2 : 1, rng);
    const energy = hardWorkEnergy(state.character, ctx, FORAGE_ENERGY);
    return log(bring(noteFinds(state, ids), ctx, { key: place.id, ids, energy }), {
      heading: `Foraging in ${place.name}`,
      text: sharp
        ? 'You go slowly and look closely, and the ground gives up more than most would see.'
        : 'You search until your knees are muddy and come back with a handful.',
      tone: 'info',
      chips: haulChips(ctx, { ids, energy }, newEntryChips(state, ids)),
    });
  },
};

function spotOf(state: GameState, ctx: GameContext, action: ActionOf<'fish'>) {
  const place = wildsHere(state, ctx, action.placeId);
  const spot = place?.spots?.find((s) => s.id === action.spotId);
  return place && spot ? { place, spot } : null;
}

export const fish: ActionHandler<ActionOf<'fish'>> = {
  check(state, action, ctx) {
    const found = spotOf(state, ctx, action);
    if (!found) return 'There’s nowhere to fish like that here.';
    const { place, spot } = found;
    return firstBlocker(
      hardWorkBlockers(state, ctx, hardWorkEnergy(state.character, ctx, FISH_ENERGY)),
      gatheredToday(state.cooking.gathered, spotKey(place.id, spot.id), state.time.day) &&
        `You’ve already fished ${spot.name.toLowerCase()} today.`,
      findsHereNow(state, spot.catches).length === 0 && 'Nothing you know bites here at this hour.',
    );
  },
  perform(state, action, ctx, rng) {
    const found = spotOf(state, ctx, action);
    if (!found) return state;
    const { place, spot } = found;
    const bites = rollCheck(state.character.stats.willpower, PATIENCE_DIFFICULTY, rng).success;
    const ids = bites ? draws(findsHereNow(state, spot.catches), 1, rng) : [];
    const energy = hardWorkEnergy(state.character, ctx, FISH_ENERGY);
    const key = spotKey(place.id, spot.id);
    const [caught] = ids;
    const landing = caught
      ? landCatch(state, ctx, { ingredientId: caught, spotKey: key })
      : { state, chips: [] };
    return log(bring(landing.state, ctx, { key, ids, energy }), {
      heading: `Fishing ${spot.name.toLowerCase()}`,
      text: bites
        ? 'You sit still long enough for the river to forget you, and something takes the line.'
        : 'You fidget, the float never dips, and you go home with wet feet.',
      tone: bites ? 'success' : 'info',
      chips: haulChips(ctx, { ids, energy }, landing.chips),
    });
  },
};
