import { advance, holds, type DecisionOption } from '@/systems/missions';

import type { GameContext } from '../context';
import { activeMission, activeStage, afterStage } from '../missionFlow';
import { campActivity, campChoices, campOver } from '../story/camp';
import { decide } from '../story/decide';
import { storyOf } from '../story/state';
import type { GameState } from '../state';
import { walkOn } from './travel';
import type { ActionHandler, ActionOf } from './types';

/**
 * The story's own choices on a job: a decision (or something that came up on the road), and
 * what to do by the fire. Checks, encounters and moving on are `mission.ts`.
 */

/** The options open now: a road event's, or the decision stage's. */
export function openOptions(state: GameState, ctx: GameContext): readonly DecisionOption[] {
  const run = state.mission;
  if (!run) return [];
  if (run.roadEvent) return ctx.content.roadEvents.get(run.roadEvent)?.options ?? [];
  const stage = activeStage(state, ctx);
  return stage?.kind === 'decision' ? stage.options : [];
}

export const missionDecide: ActionHandler<ActionOf<'missionDecide'>> = {
  check(state, action, ctx) {
    if (state.combat) return 'You are in the middle of a fight.';
    const option = openOptions(state, ctx)[action.optionIndex];
    if (!state.mission || !option) return 'There is no decision to make right now.';
    return holds(storyOf(state.mission), option.when) ? null : 'That isn’t open to you here.';
  },
  perform(state, action, ctx, rng) {
    const def = activeMission(state, ctx);
    const option = openOptions(state, ctx)[action.optionIndex];
    if (!def || !option) return state;
    const decided = decide(state, ctx, def, option);
    if (!decided.mission) return decided;
    // On a quick trip, the road event dealt with, you hurry on.
    return walkOn(afterStage({ ...decided, mission: advance(decided.mission) }, ctx), ctx, rng);
  },
};

export const missionCamp: ActionHandler<ActionOf<'missionCamp'>> = {
  check(state, action, ctx) {
    if (state.combat) return 'You are in the middle of a fight.';
    const stage = activeStage(state, ctx);
    if (stage?.kind !== 'camp') return 'You aren’t in camp.';
    return campChoices(state, stage).includes(action.activityIndex)
      ? null
      : 'There’s no time for that tonight.';
  },
  perform(state, action, ctx, rng) {
    const def = activeMission(state, ctx);
    const stage = activeStage(state, ctx);
    const activity = stage?.kind === 'camp' ? stage.activities[action.activityIndex] : undefined;
    if (!def || stage?.kind !== 'camp' || !activity) return state;
    const turn = { def, activity, index: action.activityIndex };
    const done = campActivity(state, ctx, rng, turn);
    if (!done.mission || !campOver(done, stage)) return done;
    const burnedDown = advance(done.mission, {
      kind: 'story',
      text: 'The fire burns down to embers.',
    });
    return afterStage({ ...done, mission: burnedDown }, ctx);
  },
};
