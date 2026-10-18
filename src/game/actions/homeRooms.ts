import { fillSlots } from '@/core';
import { stageOf } from '@/systems/bonds';
import { isRipe, plant, setGuest } from '@/systems/housing';
import { stock } from '@/systems/inventory';
import { seasonOf } from '@/systems/time';
import { deduct } from '@/systems/wallet';

import type { GameContext } from '../context';
import { atHome, hasRoom } from '../home/home';
import { homeVillageId } from '../homeVillage';
import { busyReason, chip, firstBlocker, log } from '../ops';
import { bondOf, findPerson } from '../people/cast';
import { personSlots } from '../people/pronouns';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/**
 * The rooms a bigger home opens: a garden whose beds grow kitchen ingredients from seed in their
 * season, and a guest room a friend can stay in (they are at your home every evening and night).
 */

/** What a ripe bed gives. */
export const PICK_YIELD = 2;
/** A guest has to be a friend first. */
export const GUEST_STAGE = 2;

function gardenBlocker(state: GameState, ctx: GameContext): string | null {
  return firstBlocker(
    busyReason(state),
    !atHome(state, ctx) && 'Do it at home.',
    !hasRoom(state, ctx, 'garden') && 'Your home has no garden.',
  );
}

export const plantBed: ActionHandler<ActionOf<'plantBed'>> = {
  check(state, action, ctx) {
    const crop = ctx.content.gardenCrops.find((c) => c.ingredientId === action.ingredientId);
    if (!crop) return 'Nothing like that grows here.';
    const bed = state.housing.beds[action.bed];
    return firstBlocker(
      gardenBlocker(state, ctx),
      bed === undefined && 'There’s no such bed.',
      bed !== null && bed !== undefined && 'Something is already growing there.',
      !crop.seasons.includes(seasonOf(state.time.day)) && 'It won’t grow this season.',
      state.wallet.ryo < crop.seedCost && `Seed costs ${crop.seedCost} ryo.`,
    );
  },
  perform(state, action, ctx) {
    const crop = ctx.content.gardenCrops.find((c) => c.ingredientId === action.ingredientId);
    if (!crop) return state;
    const planted = plant(state.housing, action.bed, {
      ingredientId: crop.ingredientId,
      plantedDay: state.time.day,
    });
    return { ...state, housing: planted, wallet: deduct(state.wallet, crop.seedCost) };
  },
};

export const pickBed: ActionHandler<ActionOf<'pickBed'>> = {
  check(state, action, ctx) {
    const bed = state.housing.beds[action.bed];
    const crop = bed && ctx.content.gardenCrops.find((c) => c.ingredientId === bed.ingredientId);
    return firstBlocker(
      gardenBlocker(state, ctx),
      !bed && 'Nothing is growing there.',
      !!bed && !!crop && !isRipe(bed, crop.days, state.time.day) && 'It isn’t ready yet.',
    );
  },
  perform(state, action, ctx) {
    const bed = state.housing.beds[action.bed];
    if (!bed) return state;
    const name = ctx.content.ingredients.get(bed.ingredientId)?.name ?? bed.ingredientId;
    return log(
      {
        ...state,
        housing: plant(state.housing, action.bed, null),
        inventory: stock(state.inventory, bed.ingredientId, PICK_YIELD),
      },
      {
        heading: 'The garden',
        text: 'You pick it with the dew still on, and carry it in to the pantry.',
        tone: 'success',
        chips: [chip(`+${PICK_YIELD} ${name}`, 'gain')],
      },
    );
  },
};

export const inviteGuest: ActionHandler<ActionOf<'inviteGuest'>> = {
  check(state, action, ctx) {
    const person = findPerson(state, ctx, action.personId);
    if (!person) return 'You don’t know anyone by that name.';
    const home = homeVillageId(state, ctx);
    return firstBlocker(
      busyReason(state),
      !atHome(state, ctx) &&
        fillSlots('Ask {guest.them} round from home.', personSlots('guest', person)),
      !hasRoom(state, ctx, 'guest') && 'Your home has no guest room.',
      state.housing.guestId !== null && 'Someone is already staying.',
      (person.homeLocationId ?? ctx.content.startLocationId) !== home &&
        `${person.name} lives too far away.`,
      stageOf(bondOf(state, person.id).points) < GUEST_STAGE &&
        `You don’t know ${person.name} well enough yet.`,
    );
  },
  perform(state, action, ctx) {
    const person = findPerson(state, ctx, action.personId);
    if (!person) return state;
    return log(
      { ...state, housing: setGuest(state.housing, person.id) },
      {
        heading: `${person.name} moves in`,
        text: `${person.name} arrives with one bag and opinions about where everything should go.`,
        tone: 'success',
      },
    );
  },
};

export const sendGuestHome: ActionHandler<ActionOf<'sendGuestHome'>> = {
  check(state) {
    return state.housing.guestId ? null : 'Nobody is staying.';
  },
  perform(state, _action, ctx) {
    const person = state.housing.guestId && findPerson(state, ctx, state.housing.guestId);
    return log(
      { ...state, housing: setGuest(state.housing, null) },
      {
        heading: 'The guest room',
        text: person
          ? `${person.name} packs the one bag and goes home. The house is quieter.`
          : 'The guest room is empty again.',
        tone: 'info',
      },
    );
  },
};
