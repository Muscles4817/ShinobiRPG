import { advance, resolveCheck, startRun } from '@/systems/missions';

import { availability, takeJob } from '../board';

import {
  activeMission,
  activeStage,
  beginCombat,
  completeIfFinished,
  failMission,
} from '../missionFlow';
import {
  adjust,
  busyReason,
  firstBlocker,
  healthFraction,
  log,
  placeHere,
  spendTime,
} from '../ops';
import type { ActionHandler, ActionOf } from './types';

const MIN_HEALTH_FOR_MISSION = 0.4;

export const startMission: ActionHandler<ActionOf<'startMission'>> = {
  check(state, action, ctx) {
    const def = ctx.content.missions.get(action.missionId);
    const hall = placeHere(state, ctx, 'missions');
    if (!def || !hall?.missionIds.includes(def.id)) return 'That job isn’t posted here.';
    const on = availability(state, ctx, def);
    if (on.kind === 'absent') return 'That job isn’t on the board right now.';
    return firstBlocker(
      busyReason(state),
      on.kind === 'standing' && on.doneToday && 'You’ve done that today. Come back tomorrow.',
      state.character.vitals.energy < def.energyCost && `Needs ${def.energyCost} energy.`,
      healthFraction(state) < MIN_HEALTH_FOR_MISSION && 'You are too injured to take a mission.',
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.missions.require(action.missionId);
    const taken = { ...state, board: takeJob(state, ctx, def), mission: startRun(def) };
    const started = adjust(spendTime(taken, def.slots, ctx), {
      energy: -def.energyCost,
    });
    return log(started, { heading: def.title, text: def.summary, tone: 'info' });
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
      const mission = advance(state.mission, { kind: 'story', text: stage.text });
      return completeIfFinished({ ...state, mission }, ctx);
    }
    return state;
  },
};
