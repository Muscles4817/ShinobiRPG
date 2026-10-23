import {
  holds,
  type MissionDef,
  type MissionNote,
  type MissionRun,
  type MissionStage,
} from '@/systems/missions';
import { STAT_INFO } from '@/systems/stats';

import type { GameContext } from '../context';
import { activeMission, activeStage } from '../missionFlow';
import type { GameState } from '../state';
import { storyOf } from '../story/state';
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

/** One stage of the job's route, as a stamp. */
export interface RouteMark {
  readonly glyph: string;
  readonly label: string;
  readonly state: 'done' | 'now' | 'ahead';
}

export interface MissionScene {
  readonly title: string;
  /** What kind of trip this is, above the title: a job's rank and client, or a journey. */
  readonly kicker: string;
  readonly lines: readonly SceneLine[];
  readonly threads: readonly ThreadView[];
  readonly route: readonly RouteMark[];
  /** The current situation, shown last in the feed. */
  readonly prompt: string | null;
  readonly choices: readonly SceneChoice[];
}

export type { SceneChoice };

/**
 * A line of the mission's story as the scene shows it. A roll is a stamp with the stat it
 * tested; its odds were on the choice, and story text never carries numbers.
 */
export function noteLine(n: MissionNote): SceneLine {
  return n.kind === 'roll'
    ? { kind: 'roll', success: n.success, text: STAT_INFO[n.stat].label }
    : n;
}

const ROUTE_MARKS: Readonly<Record<MissionStage['kind'], { glyph: string; label: string }>> = {
  narrative: { glyph: '話', label: 'Story' },
  leg: { glyph: '道', label: 'The road' },
  road: { glyph: '道', label: 'The road' },
  check: { glyph: '試', label: 'A trial' },
  decision: { glyph: '選', label: 'A choice' },
  camp: { glyph: '火', label: 'Camp' },
  stop: { glyph: '宿', label: 'A stop' },
  encounter: { glyph: '敵', label: 'Foes' },
  combat: { glyph: '戦', label: 'A fight' },
  ending: { glyph: '終', label: 'The end' },
};

/**
 * The job's route as stamps: the stages behind you, the one you're at, and those ahead that
 * the story so far would play (a stage the story passes over isn't shown).
 */
function routeOf(def: MissionDef, run: MissionRun): RouteMark[] {
  const story = storyOf(run);
  return def.stages.flatMap((stage, i) => {
    const state = i < run.stageIndex ? 'done' : i === run.stageIndex ? 'now' : 'ahead';
    if (state !== 'now' && !holds(story, stage.when)) return [];
    return [{ ...ROUTE_MARKS[stage.kind], state }];
  });
}

function threadViews(state: GameState, ctx: GameContext): ThreadView[] {
  const def = activeMission(state, ctx);
  const run = state.mission;
  if (!def || !run) return [];
  // A hidden thread (how close hunters are) is felt in the story, never shown.
  return (def.threads ?? []).flatMap((t) => {
    if (t.hidden) return [];
    const level = run.threads[t.id] ?? t.start;
    return [{ label: t.label, word: t.levels[level] ?? '', level, of: t.levels.length - 1 }];
  });
}

export function missionScene(state: GameState, ctx: GameContext): MissionScene | null {
  const def = activeMission(state, ctx);
  if (!def || !state.mission || state.combat) return null;
  const stage = activeStage(state, ctx);
  const base = {
    title: def.title,
    kicker: state.mission.journey
      ? 'A journey of your own'
      : `${def.rank}-rank mission for ${def.client}`,
    lines: state.mission.notes.map(noteLine),
    threads: threadViews(state, ctx),
    route: routeOf(def, state.mission),
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
