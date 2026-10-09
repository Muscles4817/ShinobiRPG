import { advance, resolveCheck, startRun } from '@/systems/missions';

import {
  activeMission,
  activeStage,
  beginCombat,
  completeIfFinished,
  failMission,
} from '../missionFlow';
import { adjust, busyReason, firstBlocker, healthFraction, log, spendTime } from '../ops';
import type { ActionHandler, ActionOf } from './types';

const MIN_HEALTH_FOR_MISSION = 0.4;

export const startMission: ActionHandler<ActionOf<'startMission'>> = {
  check(state, action, ctx) {
    const def = ctx.content.missions.get(action.missionId);
    if (!def) return 'Unknown mission.';
    return firstBlocker(
      busyReason(state),
      state.standing.missionsCompleted < def.minMissionsCompleted &&
        `Complete ${def.minMissionsCompleted} missions first.`,
      state.character.vitals.energy < def.energyCost && 'You are too tired for this mission.',
      healthFraction(state) < MIN_HEALTH_FOR_MISSION && 'You are too injured to take a mission.',
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.missions.require(action.missionId);
    const started = adjust(spendTime({ ...state, mission: startRun(def) }, def.slots), {
      energy: -def.energyCost,
    });
    return log(started, `You accept the mission "${def.title}" from ${def.client}.`);
  },
};

export const missionChoose: ActionHandler<ActionOf<'missionChoose'>> = {
  check(state, action, ctx) {
    if (state.combat) return 'You are in the middle of a fight.';
    const stage = activeStage(state, ctx);
    if (stage?.kind !== 'check') return 'There is no decision to make right now.';
    return stage.approaches[action.approachIndex] ? null : 'Unknown approach.';
  },
  perform(state, action, ctx, rng) {
    const stage = activeStage(state, ctx);
    const approach = stage?.kind === 'check' ? stage.approaches[action.approachIndex] : undefined;
    if (!state.mission || stage?.kind !== 'check' || !approach) return state;

    const result = resolveCheck(state.mission, { stage, approach }, state.character.stats, rng);
    const hurt = adjust({ ...state, mission: result.run }, { health: -result.damage });
    if (result.aborted) return failMission(hurt, ctx, stage.failure);
    return completeIfFinished(hurt, ctx);
  },
};

export const missionContinue: ActionHandler<ActionOf<'missionContinue'>> = {
  check(state, _action, ctx) {
    if (state.combat) return 'You are in the middle of a fight.';
    const stage = activeStage(state, ctx);
    if (!stage) return activeMission(state, ctx) ? null : 'You are not on a mission.';
    return stage.kind === 'check' ? 'Choose an approach first.' : null;
  },
  perform(state, _action, ctx, rng) {
    const stage = activeStage(state, ctx);
    if (!state.mission || !stage) return completeIfFinished(state, ctx);
    if (stage.kind === 'combat') return beginCombat(state, ctx, rng);
    if (stage.kind === 'narrative') {
      return completeIfFinished({ ...state, mission: advance(state.mission, stage.text) }, ctx);
    }
    return state;
  },
};
