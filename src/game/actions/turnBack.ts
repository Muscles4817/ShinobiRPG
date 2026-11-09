import { startRun } from '@/systems/missions';

import { HUNT_THREAD } from '../hunt';
import { activeStage } from '../missionFlow';
import { journeyMission, legsBack, legsWalked, turningBack } from '../journeys';
import { plannedStops } from '../journeyStops';
import { settle } from '../story/state';
import { ventureAhead, turnOut } from '../ventures';
import type { ActionHandler, ActionOf } from './types';

/**
 * Turning back on a trip of your own: at a camp, before the next stretch, you walk back the
 * legs you came by. Passage paid and leave spent stay spent. A venture turns back the same way,
 * walking out of the wild from the depth it reached (`ventures.ts`).
 */
export const turnBack: ActionHandler<ActionOf<'turnBack'>> = {
  check(state, _action, ctx) {
    if (!state.mission?.journey && !ventureAhead(state, ctx)) {
      return 'You are not on a trip of your own.';
    }
    return activeStage(state, ctx)?.kind === 'camp' ? null : 'You can turn back only at a camp.';
  },
  perform(state, _action, ctx) {
    const run = state.mission;
    const reached = ventureAhead(state, ctx);
    if (reached) return turnOut(state, ctx, reached);
    const plan = run?.journey;
    if (!run || !plan) return state;
    const legs = legsBack(plan, legsWalked(run, journeyMission(plan, ctx).stages));
    // You turn back on the road you were walking: it starts from the last place you passed.
    const back = {
      from: legs[0]?.toward ?? plan.to,
      to: plan.from,
      legs,
      quick: plan.quick,
      stops: plannedStops(state, ctx, legs, plan.quick),
      // The hunters are as close on the way back as they had come.
      ...(plan.hunt ? { hunt: { ...plan.hunt, heat: run.threads[HUNT_THREAD] ?? 0 } } : {}),
    };
    const def = journeyMission(back, ctx);
    const returning = settle(def, { ...startRun(def, run.crew), journey: back });
    const home = ctx.content.locations.require(back.to).name;
    return turningBack(
      { ...state, mission: returning },
      `You break camp and take the road back to ${home}.`,
    );
  },
};
