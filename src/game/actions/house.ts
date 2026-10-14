import { buyHouse as owning, ownsHouse } from '@/systems/housing';
import { spend } from '@/systems/wallet';

import { busyReason, chip, firstBlocker, log, placeHere } from '../ops';
import type { ActionHandler, ActionOf } from './types';

/**
 * Buying a house in a town: paid outright to the seller, and yours from then on, a second home
 * to sleep in with no rent. Your home in the village stays where it is.
 */
export const buyHouse: ActionHandler<ActionOf<'buyHouse'>> = {
  check(state, _action, ctx) {
    const house = placeHere(state, ctx, 'house');
    if (!house) return 'There is no house for sale here.';
    return firstBlocker(
      busyReason(state),
      ownsHouse(state.housing, house.id) && 'It is yours already.',
      state.wallet.ryo < house.price && `The house costs ${house.price} ryo.`,
    );
  },
  perform(state, _action, ctx) {
    const house = placeHere(state, ctx, 'house');
    const paid = house ? spend(state.wallet, house.price) : null;
    if (!house || !paid?.ok) return state;
    return log(
      { ...state, wallet: paid.value, housing: owning(state.housing, house.id) },
      {
        heading: house.name,
        text: `${house.seller} counts the coins twice and hands over the key. The house is yours.`,
        tone: 'success',
        chips: [chip(`−${house.price} ryo`, 'cost'), chip('A house of your own', 'gain')],
      },
    );
  },
};
