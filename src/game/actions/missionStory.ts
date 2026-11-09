import { advance, holds } from '@/systems/missions';

import type { GameContext } from '../context';
import { activeMission, activeStage, afterStage } from '../missionFlow';
import { campActivity, campChoices, campOver, campWithSensei } from '../story/camp';
import { campLine } from '../story/campLines';
import { SENSEI_FIRESIDE } from '../story/fireside';
import { decide } from '../story/decide';
import { afterRoadChoice } from '../story/roadAfter';
import { roadChoices, type RoadChoice } from '../story/roadChoices';
import { storyOf } from '../story/state';
import type { GameState } from '../state';
import { walkOn } from './travel';
import type { ActionHandler, ActionOf } from './types';

/**
 * The story's own choices on a job: a decision (or something that came up on the road), and
 * what to do by the fire. Checks, encounters and moving on are `mission.ts`.
 */

/** The choices open now: a road event's (with what each leaves to do), or the decision stage's. */
export function openChoices(state: GameState, ctx: GameContext): readonly RoadChoice[] {
  const run = state.mission;
  if (!run) return [];
  const event = run.roadEvent ? ctx.content.roadEvents.get(run.roadEvent) : undefined;
  if (event) return roadChoices(state, ctx, event);
  const stage = activeStage(state, ctx);
  return stage?.kind === 'decision' ? stage.options.map((option) => ({ option })) : [];
}

export const missionDecide: ActionHandler<ActionOf<'missionDecide'>> = {
  check(state, action, ctx) {
    if (state.combat) return 'You are in the middle of a fight.';
    const option = openChoices(state, ctx)[action.optionIndex]?.option;
    if (!state.mission || !option) return 'There is no decision to make right now.';
    return holds(storyOf(state.mission), option.when) ? null : 'That isn’t open to you here.';
  },
  perform(state, action, ctx, rng) {
    const def = activeMission(state, ctx);
    const choice = openChoices(state, ctx)[action.optionIndex];
    if (!def || !choice) return state;
    const decided = afterRoadChoice(decide(state, ctx, def, choice.option), ctx, choice);
    if (!decided.mission) return decided;
    // Foes faced on the road stand in the way: the run waits on them before it moves on.
    if (decided.mission.detour) return walkOn(decided, ctx, rng);
    // On a quick trip, the road event dealt with, you hurry on.
    return walkOn(afterStage({ ...decided, mission: advance(decided.mission) }, ctx), ctx, rng);
  },
};

export const missionCamp: ActionHandler<ActionOf<'missionCamp'>> = {
  check(state, action, ctx) {
    if (state.combat) return 'You are in the middle of a fight.';
    const stage = activeStage(state, ctx);
    if (stage?.kind !== 'camp') return 'You aren’t in camp.';
    return campChoices(state, ctx, stage).includes(action.activityIndex)
      ? null
      : 'There’s no time for that tonight.';
  },
  perform(state, action, ctx, rng) {
    const def = activeMission(state, ctx);
    const stage = activeStage(state, ctx);
    const activity = stage?.kind === 'camp' ? stage.activities[action.activityIndex] : undefined;
    if (!def || stage?.kind !== 'camp') return state;
    const fireside = action.activityIndex === SENSEI_FIRESIDE;
    if (!fireside && !activity) return state;
    const done =
      fireside || !activity
        ? campWithSensei(state, ctx)
        : campActivity(state, ctx, rng, { def, activity, index: action.activityIndex });
    if (!done.mission || !campOver(done, stage)) return done;
    const embers = campLine(done, ctx, 'embers');
    const burnedDown = advance(done.mission, { kind: 'story', text: embers.text });
    return afterStage({ ...done, told: embers.told, mission: burnedDown }, ctx);
  },
};
