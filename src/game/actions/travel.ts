import { SLOTS_PER_DAY } from '@/systems/time';
import { spend } from '@/systems/wallet';

import { busyReason, chip, firstBlocker, log, spendTime } from '../ops';
import type { ActionHandler, ActionOf } from './types';

export const travel: ActionHandler<ActionOf<'travel'>> = {
  check(state, action, ctx) {
    const destination = ctx.content.locations.get(action.locationId);
    if (!destination) return 'Unknown destination.';
    return firstBlocker(
      busyReason(state),
      destination.id === state.locationId && 'You are already here.',
      destination.travel.lockedReason ?? null,
      state.wallet.ryo < destination.travel.cost &&
        `The journey costs ${destination.travel.cost} ryo.`,
    );
  },
  perform(state, action, ctx) {
    const destination = ctx.content.locations.require(action.locationId);
    const { days, cost } = destination.travel;
    const paid = spend(state.wallet, cost);
    if (!paid.ok) return state;
    const arrived = spendTime(
      { ...state, wallet: paid.value, locationId: destination.id },
      days * SLOTS_PER_DAY,
    );
    return log(arrived, {
      heading: `Travel to ${destination.name}`,
      text: `After ${days === 1 ? 'a day' : `${days} days`} on the road, you arrive in ${destination.name}.`,
      tone: 'info',
      chips: [chip(`${days} days`, 'info'), ...(cost > 0 ? [chip(`−${cost} ryo`, 'cost')] : [])],
    });
  },
};

export const dismissReport: ActionHandler<ActionOf<'dismissReport'>> = {
  check(state) {
    return state.reports.length > 0 ? null : 'Nothing to dismiss.';
  },
  perform(state) {
    return { ...state, reports: state.reports.slice(1) };
  },
};
