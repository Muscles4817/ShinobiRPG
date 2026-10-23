import type { Rng } from '@/core';
import { spend } from '@/systems/wallet';

import { knowsOf } from '../atlas';
import type { GameContext } from '../context';
import { gateRefusal } from '../greetings';
import { huntForTrip } from '../hunt';
import { journeyTo, setOut } from '../journeys';
import { plannedStops } from '../journeyStops';
import { activeStage } from '../missionFlow';
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
  // A stop waits on your choice, as a road event does.
  while (
    now.mission?.journey?.quick === true &&
    !now.mission.roadEvent &&
    activeStage(now, ctx)?.kind !== 'stop'
  ) {
    now = missionContinue.perform(now, { type: 'missionContinue' }, ctx, rng);
  }
  return now;
}

export const travel: ActionHandler<ActionOf<'travel'>> = {
  check(state, action, ctx) {
    const destination = ctx.content.locations.get(action.locationId);
    if (!destination) return 'Unknown destination.';
    if (!knowsOf(state, ctx, destination.id)) return 'You don’t know the way there yet.';
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
    const hunt = huntForTrip(state, ctx, journey.legs);
    const quick = action.quick === true;
    const plan = {
      from: state.locationId,
      to: action.locationId,
      legs: journey.legs,
      quick,
      stops: plannedStops(state, ctx, journey.legs, quick),
      ...(hunt ? { hunt } : {}),
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

/** Done watching a trip end: the map closes on the place you walked to. */
export const leaveJourney: ActionHandler<ActionOf<'leaveJourney'>> = {
  check(state) {
    return state.journeyEnd ? null : 'You have not just arrived anywhere.';
  },
  perform(state) {
    return { ...state, journeyEnd: null };
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
