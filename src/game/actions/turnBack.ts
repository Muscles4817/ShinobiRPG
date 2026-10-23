import { startRun } from '@/systems/missions';

import { HUNT_THREAD } from '../hunt';
import { activeStage } from '../missionFlow';
import { journeyMission, legsBack, legsWalked } from '../journeys';
import { log } from '../ops';
import { settle } from '../story/state';
import type { ActionHandler, ActionOf } from './types';

/**
 * Turning back on a trip of your own: at a camp, before the next stretch, you walk back the
 * legs you came by. Passage paid and leave spent stay spent.
 */
export const turnBack: ActionHandler<ActionOf<'turnBack'>> = {
  check(state, _action, ctx) {
    if (!state.mission?.journey) return 'You are not on a trip of your own.';
    return activeStage(state, ctx)?.kind === 'camp' ? null : 'You can turn back only at a camp.';
  },
  perform(state, _action, ctx) {
    const run = state.mission;
    const plan = run?.journey;
    if (!run || !plan) return state;
    const legs = legsBack(plan, legsWalked(run, journeyMission(plan, ctx).stages));
    // You turn back on the road you were walking: it starts from the last place you passed.
    const back = {
      from: legs[0]?.toward ?? plan.to,
      to: plan.from,
      legs,
      quick: plan.quick,
      // The hunters are as close on the way back as they had come.
      ...(plan.hunt ? { hunt: { ...plan.hunt, heat: run.threads[HUNT_THREAD] ?? 0 } } : {}),
    };
    const def = journeyMission(back, ctx);
    const returning = settle(def, { ...startRun(def, run.crew), journey: back });
    const home = ctx.content.locations.require(back.to).name;
    return log(
      { ...state, mission: returning },
      {
        heading: 'Turning back',
        text: `You break camp and take the road back to ${home}.`,
        tone: 'warning',
      },
    );
  },
};
