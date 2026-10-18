import type { HomeDef } from '@/content';
import {
  addFurniture,
  moveHome as moveInto,
  ownsFurniture,
  placeFurniture,
} from '@/systems/housing';
import { RANK_LABELS, RANKS } from '@/systems/standing';
import { deduct } from '@/systems/wallet';

import type { GameContext } from '../context';
import { atHome, currentHome } from '../home/home';
import { busyReason, chip, firstBlocker, log, placeHere } from '../ops';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/**
 * Making a home: moving up the ladder at the lettings office (renting, or buying where a home
 * is for sale), buying furniture from the joiner next door (laid out at once if your home has
 * the spot), and setting a piece you own in its spot at home.
 */

/** Why you can't have this home yet, or null. */
export function homeNeeds(state: GameState, home: HomeDef): string | null {
  const { rank, missionsCompleted } = home.needs ?? {};
  if (rank && RANKS.indexOf(state.standing.rank) < RANKS.indexOf(rank)) {
    return `Needs ${RANK_LABELS[rank]} rank.`;
  }
  if (missionsCompleted && state.standing.missionsCompleted < missionsCompleted) {
    return `Needs ${missionsCompleted} jobs on your record.`;
  }
  return null;
}

function lettingsOffering(state: GameState, ctx: GameContext) {
  return placeHere(state, ctx, 'lettings');
}

/** What taking the home costs now: the price, or the first week's rent. */
export function moveCost(home: HomeDef, buy: boolean): number | null {
  return (buy ? home.price : home.rentPerWeek) ?? null;
}

export const moveHome: ActionHandler<ActionOf<'moveHome'>> = {
  check(state, action, ctx) {
    const office = lettingsOffering(state, ctx);
    const home = ctx.content.homes.get(action.homeId);
    if (!office?.homeIds.includes(action.homeId) || !home) return 'That home isn’t let here.';
    const cost = moveCost(home, action.buy);
    return firstBlocker(
      busyReason(state),
      home.lockedReason ?? null,
      state.housing.homeId === home.id && 'You already live there.',
      homeNeeds(state, home),
      cost === null && (action.buy ? 'That home isn’t for sale.' : 'That home isn’t let.'),
      cost !== null && state.wallet.ryo < cost && `Needs ${cost} ryo.`,
    );
  },
  perform(state, action, ctx) {
    const home = ctx.content.homes.require(action.homeId);
    const cost = moveCost(home, action.buy) ?? 0;
    const housing = moveInto(state.housing, {
      homeId: home.id,
      lodging: home.lodging,
      rentPerWeek: action.buy ? 0 : (home.rentPerWeek ?? 0),
      today: state.time.day,
      spots: home.spots,
      beds: home.beds ?? 0,
      guestRoom: home.rooms.includes('guest'),
    });
    return log(
      { ...state, housing, wallet: deduct(state.wallet, cost) },
      {
        heading: `Moving day: ${home.lodging}`,
        text: home.movingIn,
        tone: 'success',
        chips: [chip(`−${cost} ryo`, 'cost'), chip(action.buy ? 'Yours' : 'Rented', 'gain')],
      },
    );
  },
};

export const buyFurnishing: ActionHandler<ActionOf<'buyFurnishing'>> = {
  check(state, action, ctx) {
    const office = lettingsOffering(state, ctx);
    const piece = ctx.content.furnishings.get(action.furnishingId);
    if (!office?.furnishingIds.includes(action.furnishingId) || piece?.cost === undefined) {
      return 'The joiner doesn’t make that.';
    }
    return firstBlocker(
      busyReason(state),
      ownsFurniture(state.housing, piece.id) && 'You already own one.',
      state.wallet.ryo < piece.cost && `Needs ${piece.cost} ryo.`,
    );
  },
  perform(state, action, ctx) {
    const piece = ctx.content.furnishings.require(action.furnishingId);
    const cost = piece.cost ?? 0;
    const owned = addFurniture(state.housing, piece.id);
    const fits = currentHome(state, ctx).spots.includes(piece.spot);
    const housing = fits ? placeFurniture(owned, piece.spot, piece.id) : owned;
    return log(
      { ...state, housing, wallet: deduct(state.wallet, cost) },
      {
        heading: piece.name,
        text: fits
          ? 'The joiner’s boy carries it home and sets it where it belongs.'
          : 'The joiner’s boy carries it home. There’s nowhere to put it yet.',
        tone: 'info',
        chips: [chip(`−${cost} ryo`, 'cost')],
      },
    );
  },
};

export const placeFurnishing: ActionHandler<ActionOf<'placeFurnishing'>> = {
  check(state, action, ctx) {
    const piece = ctx.content.furnishings.get(action.furnishingId);
    if (!piece || !ownsFurniture(state.housing, piece.id)) return 'You don’t own that.';
    return firstBlocker(
      busyReason(state),
      !atHome(state, ctx) && 'Do it at home.',
      !currentHome(state, ctx).spots.includes(piece.spot) && 'There’s nowhere here for it.',
      state.housing.placed[piece.spot] === piece.id && 'It’s already there.',
    );
  },
  perform(state, action, ctx) {
    const piece = ctx.content.furnishings.require(action.furnishingId);
    return { ...state, housing: placeFurniture(state.housing, piece.spot, piece.id) };
  },
};
