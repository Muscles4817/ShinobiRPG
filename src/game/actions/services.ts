import { daysOfRentLeft, DAYS_PER_RENT_PERIOD, isRentFree, payWeek } from '@/systems/housing';
import { treat as treatInjury } from '@/systems/injuries';
import { MAX_HEALTH } from '@/systems/vitals';
import { spend } from '@/systems/wallet';

import { adjust, busyReason, chip, firstBlocker, log, placeHere, spendTime } from '../ops';
import type { GameContext } from '../context';
import type { GameState } from '../state';
import { atRentedHome } from './daily';
import type { ActionHandler, ActionOf } from './types';
import { townPrice } from '../greetings';

/** Paid services: rent for your home, treatment at the hospital. */

/** Rent can be paid once less than this many days are covered, so at most ~2 weeks ahead. */
const PAY_AHEAD_WINDOW = DAYS_PER_RENT_PERIOD;

export const payRent: ActionHandler<ActionOf<'payRent'>> = {
  check(state, _action, ctx) {
    const { housing, time, wallet } = state;
    return firstBlocker(
      busyReason(state),
      !atRentedHome(state, ctx) && 'Your home is not in this village.',
      isRentFree(housing) && 'You live here rent-free.',
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
/** What each injury adds to the bill, on top of the hospital's fee. */
export const INJURY_TREATMENT_FEE = 25;

/** Injuries a medic hasn't treated yet; each can be treated once. */
export function untreatedInjuries(state: GameState): number {
  return state.character.injuries.filter((i) => !i.treated).length;
}

/** The bill for a visit: the hospital's fee for health, plus a fee per untreated injury. */
export function treatmentBill(state: GameState, ctx: GameContext): number | null {
  const hospital = placeHere(state, ctx, 'hospital');
  if (!hospital) return null;
  const bill = hospital.treatmentCost + INJURY_TREATMENT_FEE * untreatedInjuries(state);
  return townPrice(bill, state, ctx);
}

const SET_STORY = 'A medic’s glowing hands close your wounds and coax the deeper hurts to mend.';
const PATCH_STORY = 'A medic’s glowing hands close your wounds one by one.';

export const treat: ActionHandler<ActionOf<'treat'>> = {
  check(state, _action, ctx) {
    const bill = treatmentBill(state, ctx);
    if (bill === null) return 'There is no hospital here.';
    return firstBlocker(
      busyReason(state),
      state.character.vitals.health >= MAX_HEALTH &&
        untreatedInjuries(state) === 0 &&
        'You are not hurt.',
      state.wallet.ryo < bill && `Treatment costs ${bill} ryo.`,
    );
  },
  perform(state, _action, ctx) {
    const bill = treatmentBill(state, ctx) ?? 0;
    const paid = spend(state.wallet, bill);
    if (!paid.ok) return state;
    const set = untreatedInjuries(state) > 0;
    const { day } = state.time;
    const character = {
      ...state.character,
      injuries: state.character.injuries.map((i) => treatInjury(i, day)),
    };
    const treated = { ...state, character, wallet: paid.value };
    const healed = adjust(spendTime(treated, TREATMENT_SLOTS, ctx), { health: MAX_HEALTH });
    return log(healed, {
      heading: 'Treatment',
      text: set ? SET_STORY : PATCH_STORY,
      tone: 'info',
      chips: [
        chip('Health restored', 'gain'),
        ...(set ? [chip('Injuries heal faster', 'gain')] : []),
        chip(`−${bill} ryo`, 'cost'),
      ],
    });
  },
};
