import { holds, variantText, type CheckApproach, type MissionStage } from '@/systems/missions';
import { checkChance, STAT_INFO } from '@/systems/stats';

import { openOptions } from '../actions/missionStory';
import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { checkHand } from '../missionRoles';
import { rationDays } from '../road';
import { campChoices, watchOdds } from '../story/camp';
import { SENSEI_FIRESIDE, senseiAlong } from '../story/fireside';
import { endingFor } from '../story/ending';
import { storyOf } from '../story/state';
import type { GameState } from '../state';

/** What each kind of stage puts in front of you on a job: the situation, and your choices. */

export interface SceneChoice {
  readonly label: string;
  readonly detail: string;
  readonly primary: boolean;
  readonly action: GameAction;
}

export interface StagePrompt {
  readonly prompt: string | null;
  readonly choices: readonly SceneChoice[];
}

const CONTINUE: GameAction = { type: 'missionContinue' };

function onward(label: string, detail = ''): SceneChoice {
  return { label, detail, primary: true, action: CONTINUE };
}

/** The odds of a check, and who takes it when a teammate does ("Perception 70%, Kaen the tracker"). */
function checkDetail(state: GameState, ctx: GameContext, approach: CheckApproach): string {
  const hand = checkHand(state, ctx, approach);
  const odds = `${STAT_INFO[approach.stat].label} ${Math.round(checkChance(hand.value, approach.difficulty) * 100)}%`;
  return hand.personId && approach.role ? `${odds}, ${hand.name} the ${approach.role}` : odds;
}

/** What a stretch of road asks of you: "2 days on the road, food for 1 in your pack". */
function roadDetail(days: number, rations: number): string {
  const road = days === 1 ? 'A day on the road' : `${days} days on the road`;
  if (rations === 0) return `${road}, and nothing in your pack`;
  return `${road}, food for ${rations} in your pack`;
}

/** The options of a decision (or a road event), those open to you, by their real index. */
function decisionChoices(state: GameState, ctx: GameContext): SceneChoice[] {
  const run = state.mission;
  if (!run) return [];
  return openOptions(state, ctx).flatMap((o, optionIndex) =>
    holds(storyOf(run), o.when)
      ? [
          {
            label: o.label,
            detail: '',
            primary: false,
            action: { type: 'missionDecide', optionIndex },
          },
        ]
      : [],
  );
}

function campPrompt(
  state: GameState,
  ctx: GameContext,
  stage: Extract<MissionStage, { kind: 'camp' }>,
): SceneChoice[] {
  const left = stage.picks - (state.mission?.camp?.done.length ?? 0);
  const sensei = senseiAlong(state, ctx);
  const activities = campChoices(state, ctx, stage).flatMap((activityIndex): SceneChoice[] => {
    if (activityIndex === SENSEI_FIRESIDE && sensei) {
      const detail = 'They might tell you something';
      const action = { type: 'missionCamp' as const, activityIndex };
      return [{ label: `Sit with ${sensei.name}`, detail, primary: false, action }];
    }
    const activity = stage.activities[activityIndex];
    if (!activity) return [];
    const odds = watchOdds(state, ctx, activity);
    const detail =
      odds === null || activity.kind !== 'watch'
        ? ''
        : `${STAT_INFO[activity.stat].label} ${Math.round(odds * 100)}%`;
    return [
      {
        label: activity.label,
        detail,
        primary: false,
        action: { type: 'missionCamp', activityIndex },
      },
    ];
  });
  const time = left === 1 ? 'Time for one more thing' : `Time for ${left} more things`;
  return [...activities, onward('Turn in', time), ...turnBackChoice(state, ctx)];
}

/** On a trip of your own, a camp is where you can still change your mind. */
function turnBackChoice(state: GameState, ctx: GameContext): SceneChoice[] {
  const plan = state.mission?.journey;
  if (!plan) return [];
  const home = ctx.content.locations.require(plan.from).name;
  return [
    {
      label: 'Turn back',
      detail: `The road back to ${home}`,
      primary: false,
      action: { type: 'turnBack' },
    },
  ];
}

function checkChoices(
  state: GameState,
  ctx: GameContext,
  stage: Extract<MissionStage, { kind: 'check' }>,
): SceneChoice[] {
  const run = state.mission;
  if (!run) return [];
  return stage.approaches.flatMap((a, approachIndex) =>
    holds(storyOf(run), a.when)
      ? [
          {
            label: a.label,
            detail: checkDetail(state, ctx, a),
            primary: false,
            action: { type: 'missionChoose', approachIndex },
          },
        ]
      : [],
  );
}

/** The situation and choices at a stage (or at a road event waiting on you). */
export function stagePrompt(state: GameState, ctx: GameContext, stage: MissionStage): StagePrompt {
  const run = state.mission;
  if (!run) return { prompt: null, choices: [] };
  const story = storyOf(run);
  if (run.roadEvent) {
    const event = ctx.content.roadEvents.get(run.roadEvent);
    return { prompt: event?.text ?? null, choices: decisionChoices(state, ctx) };
  }
  switch (stage.kind) {
    case 'narrative':
      return {
        prompt: variantText(story, stage.text, stage.variants),
        choices: [onward('Continue')],
      };
    case 'leg':
      return {
        prompt: variantText(story, stage.text, stage.variants),
        choices: [onward('Travel on', roadDetail(stage.days, rationDays(state, ctx)))],
      };
    case 'combat':
      return {
        prompt: stage.text,
        choices: [onward('Fight', stage.canFlee ? 'You can flee' : 'No escape')],
      };
    case 'encounter':
      return {
        prompt: stage.text,
        choices: [onward('Size them up', ctx.content.encounters.require(stage.template).name)],
      };
    case 'check':
      return {
        prompt: variantText(story, stage.text, stage.variants),
        choices: checkChoices(state, ctx, stage),
      };
    case 'decision':
      return {
        prompt: variantText(story, stage.text, stage.variants),
        choices: decisionChoices(state, ctx),
      };
    case 'camp':
      return {
        prompt: variantText(story, stage.text, stage.variants),
        choices: campPrompt(state, ctx, stage),
      };
    case 'ending':
      return {
        prompt: null,
        choices: [onward(endingFor(state, stage) ? 'See it through' : 'Report back')],
      };
  }
}
