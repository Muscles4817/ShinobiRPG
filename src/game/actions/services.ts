import { daysOfRentLeft, DAYS_PER_RENT_PERIOD, payWeek } from '@/systems/housing';
import { maxHealth } from '@/systems/vitals';
import { spend } from '@/systems/wallet';

import { adjust, busyReason, chip, firstBlocker, log, placeHere, spendTime } from '../ops';
import { homeBlocker } from './daily';
import type { ActionHandler, ActionOf } from './types';

/** Paid services: rent for your home, treatment at the hospital. */

/** Rent can be paid once less than this many days are covered, so at most ~2 weeks ahead. */
const PAY_AHEAD_WINDOW = DAYS_PER_RENT_PERIOD;

export const payRent: ActionHandler<ActionOf<'payRent'>> = {
  check(state, _action, ctx) {
    const { housing, time, wallet } = state;
    return firstBlocker(
      busyReason(state),
      homeBlocker(state, ctx),
      daysOfRentLeft(housing, time.day) >= PAY_AHEAD_WINDOW && 'Your rent is paid well ahead.',
      wallet.ryo < housing.rentPerWeek && `Rent is ${housing.rentPerWeek} ryo.`,
    );
  },
  perform(state) {
    const paid = spend(state.wallet, state.housing.rentPerWeek);
    if (!paid.ok) return state;
    const housing = payWeek(state.housing);
    return log(
      { ...state, wallet: paid.value, housing },
      {
        heading: 'Pay rent',
        text: 'You count out the coins. The landlady pretends not to watch.',
        tone: 'info',
        chips: [
          chip(`−${state.housing.rentPerWeek} ryo`, 'cost'),
          chip(`Paid through day ${housing.paidThroughDay}`, 'info'),
        ],
      },
    );
  },
};

export const TREATMENT_SLOTS = 1;

export const treat: ActionHandler<ActionOf<'treat'>> = {
  check(state, _action, ctx) {
    const hospital = placeHere(state, ctx, 'hospital');
    if (!hospital) return 'There is no hospital here.';
    return firstBlocker(
      busyReason(state),
      state.character.vitals.health >= maxHealth(state.character.stats) && 'You are not hurt.',
      state.wallet.ryo < hospital.treatmentCost && `Treatment costs ${hospital.treatmentCost} ryo.`,
    );
  },
  perform(state, _action, ctx) {
    const hospital = placeHere(state, ctx, 'hospital');
    const paid = hospital ? spend(state.wallet, hospital.treatmentCost) : null;
    if (!hospital || !paid?.ok) return state;
    const healed = adjust(spendTime({ ...state, wallet: paid.value }, TREATMENT_SLOTS), {
      health: maxHealth(state.character.stats),
    });
    return log(healed, {
      heading: 'Treatment',
      text: 'A medic’s glowing hands close your wounds one by one.',
      tone: 'info',
      chips: [chip('Health restored', 'gain'), chip(`−${hospital.treatmentCost} ryo`, 'cost')],
    });
  },
};
