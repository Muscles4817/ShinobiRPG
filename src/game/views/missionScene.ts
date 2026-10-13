import type { MissionNote } from '@/systems/missions';
import { STAT_INFO } from '@/systems/stats';

import type { GameContext } from '../context';
import { activeMission, activeStage } from '../missionFlow';
import type { GameState } from '../state';
import { stagePrompt, type SceneChoice } from './storyChoices';

/**
 * A job as a scene: the story so far as a feed (with what the crew said), the threads the job
 * keeps as words and dots, the situation now, and your choices.
 */

export type SceneLine =
  | { readonly kind: 'story' | 'choice' | 'outcome'; readonly text: string }
  | { readonly kind: 'roll'; readonly text: string; readonly success: boolean }
  | { readonly kind: 'voice'; readonly speaker: string; readonly text: string };

/** A thread the job keeps, as its word and dots: "Kohaku's trust: At ease ●●○". */
export interface ThreadView {
  readonly label: string;
  readonly word: string;
  /** Dots filled, of `of`. */
  readonly level: number;
  readonly of: number;
}

export interface MissionScene {
  readonly title: string;
  readonly rank: string;
  readonly client: string;
  readonly lines: readonly SceneLine[];
  readonly threads: readonly ThreadView[];
  /** The current situation, shown last in the feed. */
  readonly prompt: string | null;
  readonly choices: readonly SceneChoice[];
}

export type { SceneChoice };

/** A line of the mission's story as the scene shows it; rolls are worded with their odds. */
export function noteLine(n: MissionNote): SceneLine {
  return n.kind === 'roll'
    ? {
        kind: 'roll',
        success: n.success,
        text: `${STAT_INFO[n.stat].label} check ${n.success ? 'passed' : 'failed'} at ${Math.round(n.chance * 100)}%`,
      }
    : n;
}

function threadViews(state: GameState, ctx: GameContext): ThreadView[] {
  const def = activeMission(state, ctx);
  const run = state.mission;
  if (!def || !run) return [];
  return (def.threads ?? []).map((t) => {
    const level = run.threads[t.id] ?? t.start;
    return { label: t.label, word: t.levels[level] ?? '', level, of: t.levels.length - 1 };
  });
}

export function missionScene(state: GameState, ctx: GameContext): MissionScene | null {
  const def = activeMission(state, ctx);
  if (!def || !state.mission || state.combat) return null;
  const stage = activeStage(state, ctx);
  const base = {
    title: def.title,
    rank: def.rank,
    client: def.client,
    lines: state.mission.notes.map(noteLine),
    threads: threadViews(state, ctx),
  };
  if (!stage) {
    const report: SceneChoice = {
      label: 'Report back',
      detail: '',
      primary: true,
      action: { type: 'missionContinue' },
    };
    return { ...base, prompt: null, choices: [report] };
  }
  return { ...base, ...stagePrompt(state, ctx, stage) };
}
