import { capitalise } from '@/core';

import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { roomPrice, stopAt, type StopOffer } from '../journeyStops';
import { placeInText } from '../placeName';
import type { GameState } from '../state';

/** A place on the way as a stage of a trip: what it is, and stopping there or walking on. */

interface StopChoice {
  readonly label: string;
  readonly detail: string;
  readonly primary: boolean;
  readonly action: GameAction;
  readonly closed?: string;
}

const STAY: GameAction = { type: 'journeyStop', stay: true };
const PASS: GameAction = { type: 'journeyStop', stay: false };
const WALK_ON: StopChoice = { label: 'Walk on', detail: '', primary: true, action: PASS };

function promptFor(offer: StopOffer): string {
  const place = placeInText(offer.location.name);
  switch (offer.kind) {
    case 'inn':
      return `The road comes into ${place} as the light goes. ${capitalise(placeInText(offer.inn.name))} has rooms.`;
    case 'sight':
      return `${capitalise(place)} is a short climb off the road.`;
    case 'wild':
      return `The road skirts ${place}.`;
  }
}

function stayChoice(state: GameState, ctx: GameContext, offer: StopOffer): StopChoice {
  const place = placeInText(offer.location.name);
  switch (offer.kind) {
    case 'inn': {
      const price = roomPrice(state, ctx, offer);
      const label = `Take a room at ${placeInText(offer.inn.name)}`;
      const short = state.wallet.ryo < price;
      return {
        label,
        detail: `${price} ryo`,
        primary: true,
        action: STAY,
        ...(short ? { closed: `A room costs ${price} ryo.` } : {}),
      };
    }
    case 'sight':
      return {
        label: `Stop at ${place}`,
        detail: 'An hour off the road',
        primary: true,
        action: STAY,
      };
    case 'wild':
      return {
        label: `Spend a day in ${place}`,
        detail: 'A day longer on the road',
        primary: false,
        action: STAY,
      };
  }
}

function passChoice(offer: StopOffer): StopChoice {
  const label =
    offer.kind === 'inn' ? `Camp outside ${placeInText(offer.location.name)}` : 'Walk on';
  return { label, detail: '', primary: offer.kind === 'wild', action: PASS };
}

/** The stop's situation and its two ways on. */
export function stopPrompt(
  state: GameState,
  ctx: GameContext,
  locationId: string,
): { readonly prompt: string | null; readonly choices: readonly StopChoice[] } {
  const offer = stopAt(ctx, locationId);
  // A stop whose place no longer offers anything (content changed under a save) just walks on.
  if (!offer) return { prompt: null, choices: [WALK_ON] };
  return { prompt: promptFor(offer), choices: [stayChoice(state, ctx, offer), passChoice(offer)] };
}
