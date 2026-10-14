import { isHungry } from '@/systems/vitals';
import { spend } from '@/systems/wallet';

import { busyReason, chip, firstBlocker, log, placeHere } from '../ops';
import { sleepTillDawn } from './daily';
import type { ActionHandler, ActionOf } from './types';

/**
 * A room for the night away from home. A strange bed rests you nearly as well as your own,
 * and the room is paid for at the desk before you go up.
 */

/** A night at an inn heals this share of what a night in your own bed would. */
export const INN_HEALTH_SHARE = 0.9;
const INN_SLEEP = 'You sleep in a rented room, to the creaks and voices of a strange house.';
const INN_SLEEP_HUNGRY = 'You lie awake a while in a rented room, your stomach complaining.';

export const takeRoom: ActionHandler<ActionOf<'takeRoom'>> = {
  check(state, _action, ctx) {
    const inn = placeHere(state, ctx, 'inn');
    if (!inn) return 'There is no inn here.';
    return firstBlocker(
      busyReason(state),
      state.wallet.ryo < inn.roomCost && `A room costs ${inn.roomCost} ryo.`,
    );
  },
  perform(state, _action, ctx) {
    const inn = placeHere(state, ctx, 'inn');
    const paid = inn ? spend(state.wallet, inn.roomCost) : null;
    if (!inn || !paid?.ok) return state;
    const booked = log(
      { ...state, wallet: paid.value },
      {
        text: `${inn.keeper} hands you a key.`,
        tone: 'info',
        chips: [chip(`−${inn.roomCost} ryo`, 'cost')],
      },
    );
    const hungry = isHungry(state.character.vitals);
    return sleepTillDawn(booked, ctx, {
      healthShare: INN_HEALTH_SHARE,
      text: hungry ? INN_SLEEP_HUNGRY : INN_SLEEP,
      uneasy: hungry,
    });
  },
};
