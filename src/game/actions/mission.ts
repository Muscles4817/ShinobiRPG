import { advance, resolveCheck, SOLO, startRun, type MissionDef } from '@/systems/missions';

import { examClash } from '../awayNotes';
import { availability, crewFor, takeJob } from '../board';

import { activeMission, activeStage, beginCombat, afterStage, failMission } from '../missionFlow';
import {
  adjust,
  busyReason,
  firstBlocker,
  healthFraction,
  log,
  placeHere,
  spendTime,
} from '../ops';
import { enterEncounter } from '../encounter/spotted';
import { checkHand } from '../missionRoles';
import { weakFromHunger } from '../hunger';
import { laidUp } from '../injuries';
import { travel } from '../road';
import type { GameContext } from '../context';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

const MIN_HEALTH_FOR_MISSION = 0.4;

/** Your sensei's refusal to sign you out for a job that would make you miss your exam. */
function senseiForbids(state: GameState, ctx: GameContext, def: MissionDef): string | null {
  const clash = examClash(state, ctx, def);
  return clash?.blocks ? clash.text : null;
}

export const startMission: ActionHandler<ActionOf<'startMission'>> = {
  check(state, action, ctx) {
    const def = ctx.content.missions.get(action.missionId);
    const hall = placeHere(state, ctx, 'missions');
    if (!def || !hall?.missionIds.includes(def.id)) return 'That job isn’t posted here.';
    const on = availability(state, ctx, def);
    if (on.kind === 'absent') return 'That job isn’t on the board right now.';
    return firstBlocker(
      busyReason(state),
      weakFromHunger(state),
      laidUp(state, ctx),
      on.kind === 'standing' && on.doneToday && 'You’ve done that today. Come back tomorrow.',
      state.character.vitals.energy < def.energyCost && `Needs ${def.energyCost} energy.`,
      healthFraction(state) < MIN_HEALTH_FOR_MISSION && 'You are too injured to take a mission.',
      senseiForbids(state, ctx, def),
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.missions.require(action.missionId);
    // `check` saw the job on the board, so the village has a crew for it.
    const crew = crewFor(state, ctx, def) ?? SOLO;
    const taken = { ...state, board: takeJob(state, ctx, def), mission: startRun(def, crew) };
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

    const hand = checkHand(state, ctx, approach);
    const choice = hand.personId ? { stage, approach, hand } : { stage, approach };
    const result = resolveCheck(state.mission, choice, state.character.stats, rng);
    const hurt = adjust({ ...state, mission: result.run }, { health: -result.damage });
    if (result.aborted) return failMission(hurt, ctx, stage.failure);
    return afterStage(hurt, ctx);
  },
};

export const missionContinue: ActionHandler<ActionOf<'missionContinue'>> = {
  check(state, _action, ctx) {
    if (state.combat) return 'You are in the middle of a fight.';
    const stage = activeStage(state, ctx);
    if (!stage) return activeMission(state, ctx) ? null : 'You are not on a mission.';
    if (stage.kind === 'check') return 'Choose an approach first.';
    return stage.kind === 'encounter' && state.mission?.encounter
      ? 'Choose how to go in first.'
      : null;
  },
  perform(state, _action, ctx, rng) {
    const stage = activeStage(state, ctx);
    if (!state.mission || !stage) return afterStage(state, ctx);
    if (stage.kind === 'combat') return beginCombat(state, ctx, rng);
    if (stage.kind === 'encounter') return enterEncounter(state, ctx, rng);
    if (stage.kind === 'leg') {
      const travelled = travel(state, ctx, stage.days, stage.text);
      if (!travelled.mission) return travelled;
      const mission = advance(travelled.mission, { kind: 'story', text: stage.text });
      return afterStage({ ...travelled, mission }, ctx);
    }
    if (stage.kind === 'narrative') {
      const mission = advance(state.mission, { kind: 'story', text: stage.text });
      return afterStage({ ...state, mission }, ctx);
    }
    return state;
  },
};
