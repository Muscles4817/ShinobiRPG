import type { Rng } from '@/core';
import { spend } from '@/systems/wallet';

import type { GameContext } from '../context';
import { gateRefusal } from '../greetings';
import { journeyTo, setOut } from '../journeys';
import { leaveBlocker, spendLeave } from '../leave';
import { busyReason, firstBlocker } from '../ops';
import type { GameState } from '../state';
import { companionBlocker } from '../trips';
import { missionContinue } from './mission';
import type { ActionHandler, ActionOf } from './types';

/**
 * Hurrying: walk leg after leg until you arrive or something on the road needs a choice.
 * Each step is the road's own Continue, so a quick trip is the same trip, unstopped.
 */
export function walkOn(state: GameState, ctx: GameContext, rng: Rng): GameState {
  let now = state;
  while (now.mission?.journey?.quick === true && !now.mission.roadEvent) {
    now = missionContinue.perform(now, { type: 'missionContinue' }, ctx, rng);
  }
  return now;
}

export const travel: ActionHandler<ActionOf<'travel'>> = {
  check(state, action, ctx) {
    const destination = ctx.content.locations.get(action.locationId);
    if (!destination) return 'Unknown destination.';
    const journey = journeyTo(state, ctx, destination.id);
    return firstBlocker(
      busyReason(state),
      destination.id === state.locationId && 'You are already here.',
      destination.lockedReason ?? null,
      gateRefusal(state, ctx, destination.id),
      !journey && 'No open road goes there yet.',
      journey && leaveBlocker(state, ctx, destination.id, journey),
      action.companionId !== undefined && companionBlocker(state, ctx, action.companionId),
      journey !== null &&
        state.wallet.ryo < journey.cost &&
        `The journey costs ${journey.cost} ryo.`,
    );
  },
  perform(state, action, ctx, rng) {
    const journey = journeyTo(state, ctx, action.locationId);
    if (!journey) return state;
    const paid = spend(state.wallet, journey.cost);
    if (!paid.ok) return state;
    const plan = {
      from: state.locationId,
      to: action.locationId,
      legs: journey.legs,
      quick: action.quick === true,
    };
    const onLeave = spendLeave({ ...state, wallet: paid.value }, ctx, action.locationId, journey);
    const trip = { plan, passage: journey.cost, companionId: action.companionId ?? null };
    return walkOn(setOut(onLeave, ctx, trip), ctx, rng);
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
