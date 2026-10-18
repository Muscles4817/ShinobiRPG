import {
  advance,
  holds,
  pickTwist,
  resolveCheck,
  SOLO,
  startRun,
  variantText,
  type MissionDef,
  type MissionStage,
} from '@/systems/missions';

import { examClash } from '../awayNotes';
import { availability, crewFor, takeJob } from '../board';
import { pickTaken } from '../sensei/pick';

import { beginCombat } from '../missionFight';
import { activeMission, activeStage, afterStage, failMission } from '../missionFlow';
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
import { welcomeBack } from '../clients';
import { bondsNow } from '../debrief';
import { travel } from '../road';
import { playEnding } from '../story/ending';
import { feel } from '../story/personal';
import { roadEventOn } from '../story/roadEvents';
import { settle, storyOf } from '../story/state';
import { crewVoice } from '../story/voices';
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
  perform(state, action, ctx, rng) {
    const def = ctx.content.missions.require(action.missionId);
    // `check` saw the job on the board, so the village has a crew for it.
    const crew = crewFor(state, ctx, def) ?? SOLO;
    // The twist is rolled now and kept hidden: the story finds it out when it gets there.
    const twist = def.twists ? pickTwist(def, rng.next()) : null;
    const begun = startRun(def, crew, twist ? [twist] : []);
    const known = welcomeBack(state, def, begun);
    const run = settle(def, {
      ...known,
      bondsAtStart: bondsNow(state, crew.memberIds),
      remembered: state.village.marks,
      tallied: state.village.tallies,
    });
    const taken = { ...pickTaken(state, ctx, def), board: takeJob(state, ctx, def), mission: run };
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
    if (stage?.kind !== 'check' || !state.mission) return 'There is no decision to make right now.';
    const approach = stage.approaches[action.approachIndex];
    if (!approach) return 'Unknown approach.';
    return holds(storyOf(state.mission), approach.when) ? null : 'That isn’t open to you here.';
  },
  perform(state, action, ctx, rng) {
    const def = activeMission(state, ctx);
    const stage = activeStage(state, ctx);
    const approach = stage?.kind === 'check' ? stage.approaches[action.approachIndex] : undefined;
    if (!def || !state.mission || stage?.kind !== 'check' || !approach) return state;

    const hand = checkHand(state, ctx, approach);
    const base = { stage, approach, story: def };
    const choice = hand.personId ? { ...base, hand } : base;
    const result = resolveCheck(state.mission, choice, state.character.stats, rng);
    const roll = result.run.notes.findLast((n) => n.kind === 'roll');
    const succeeded = roll?.kind === 'roll' && roll.success;
    const voice = crewVoice(state, ctx, succeeded ? 'check-passed' : 'check-failed');
    const voiced = voice ? { ...result.run, notes: [...result.run.notes, voice] } : result.run;
    const felt = feel({ ...state, mission: voiced }, result.personal).state;
    const hurt = adjust(felt, { health: -result.damage });
    if (result.aborted) return failMission(hurt, ctx, stage.failure);
    return afterStage(hurt, ctx);
  },
};

function continueBlocker(state: GameState, stage: MissionStage): string | null {
  if (state.mission?.roadEvent) return 'Choose what to do first.';
  switch (stage.kind) {
    case 'check':
      return 'Choose an approach first.';
    case 'decision':
      return 'Decide first.';
    case 'encounter':
      return state.mission?.encounter ? 'Choose how to go in first.' : null;
    case 'narrative':
    case 'leg':
    case 'combat':
    case 'camp':
    case 'ending':
      return null;
  }
}

/** Days on the road, and what comes up on them (a road event waits for your choice). */
function onTheRoad(
  state: GameState,
  ctx: GameContext,
  stage: Extract<MissionStage, { kind: 'leg' }>,
): GameState {
  if (!state.mission) return state;
  const line = variantText(storyOf(state.mission), stage.text, stage.variants);
  const travelled = travel(state, ctx, stage.days, line);
  if (!travelled.mission) return travelled;
  const run = travelled.mission;
  const noted = { ...run, notes: [...run.notes, { kind: 'story' as const, text: line }] };
  const event = stage.region
    ? roadEventOn({ ...travelled, mission: noted }, ctx, stage.region)
    : null;
  if (event) return { ...travelled, mission: { ...noted, roadEvent: event.id } };
  return afterStage({ ...travelled, mission: advance(noted) }, ctx);
}

export const missionContinue: ActionHandler<ActionOf<'missionContinue'>> = {
  check(state, _action, ctx) {
    if (state.combat) return 'You are in the middle of a fight.';
    const stage = activeStage(state, ctx);
    if (!stage) return activeMission(state, ctx) ? null : 'You are not on a mission.';
    return continueBlocker(state, stage);
  },
  perform(state, _action, ctx, rng) {
    const def = activeMission(state, ctx);
    const stage = activeStage(state, ctx);
    if (!def || !state.mission || !stage) return afterStage(state, ctx);
    const story = storyOf(state.mission);
    switch (stage.kind) {
      case 'combat':
        return beginCombat(state, ctx, rng);
      case 'encounter':
        return enterEncounter(state, ctx, rng);
      case 'leg':
        return onTheRoad(state, ctx, stage);
      case 'narrative': {
        const text = variantText(story, stage.text, stage.variants);
        return afterStage(
          { ...state, mission: advance(state.mission, { kind: 'story', text }) },
          ctx,
        );
      }
      case 'camp':
        // Turning in: the fire is left to burn down.
        return afterStage({ ...state, mission: advance(state.mission) }, ctx);
      case 'ending':
        return afterStage(playEnding(state, def, stage), ctx);
      case 'check':
      case 'decision':
        return state;
    }
  },
};
