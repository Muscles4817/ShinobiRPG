import { SLOTS_PER_DAY } from '@/systems/time';
import { spend } from '@/systems/wallet';

import { journeyTo } from '../journeys';
import { busyReason, chip, firstBlocker, log, spendTime } from '../ops';
import type { ActionHandler, ActionOf } from './types';

export const travel: ActionHandler<ActionOf<'travel'>> = {
  check(state, action, ctx) {
    const destination = ctx.content.locations.get(action.locationId);
    if (!destination) return 'Unknown destination.';
    const journey = journeyTo(state, ctx, destination.id);
    return firstBlocker(
      busyReason(state),
      destination.id === state.locationId && 'You are already here.',
      destination.lockedReason ?? null,
      !journey && 'No open road goes there yet.',
      journey !== null &&
        state.wallet.ryo < journey.cost &&
        `The journey costs ${journey.cost} ryo.`,
    );
  },
  perform(state, action, ctx) {
    const destination = ctx.content.locations.require(action.locationId);
    const journey = journeyTo(state, ctx, destination.id);
    if (!journey) return state;
    const { days, cost } = journey;
    const paid = spend(state.wallet, cost);
    if (!paid.ok) return state;
    const arrived = spendTime(
      { ...state, wallet: paid.value, locationId: destination.id },
      days * SLOTS_PER_DAY,
      ctx,
    );
    return log(arrived, {
      heading: `Travel to ${destination.name}`,
      text: `After ${days === 1 ? 'a day' : `${days} days`} on the road, you arrive in ${destination.name}.`,
      tone: 'info',
      chips: [chip(`${days} days`, 'info'), ...(cost > 0 ? [chip(`−${cost} ryo`, 'cost')] : [])],
    });
  },
};

/** Done watching a fight end: the scene closes and its result card (if any) shows. */
export const leaveFight: ActionHandler<ActionOf<'leaveFight'>> = {
  check(state) {
    return state.combatFinale ? null : 'There is no finished fight to leave.';
  },
  perform(state) {
    return { ...state, combatFinale: null };
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
