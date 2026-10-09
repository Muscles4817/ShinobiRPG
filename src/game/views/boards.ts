import { STAT_INFO, type StatId } from '@/systems/stats';
import { studyPoints } from '@/systems/techniques';

import { STUDY_ENERGY_COST } from '../actions/study';
import type { GameContext } from '../context';
import { placeHere } from '../ops';
import type { GameState } from '../state';
import { choice, type Choice, type Discipline } from './common';

export interface Notice extends Choice {
  readonly id: string;
  readonly title: string;
  readonly client: string;
  readonly summary: string;
  readonly rank: string;
  readonly ryo: number;
  readonly reputation: number;
  readonly slots: number;
  readonly energyCost: number;
  readonly fightLikely: boolean;
  /** Present while the job is sealed (not yet unlocked). */
  readonly opensAt?: number;
}

export interface MissionBoardView {
  readonly name: string;
  readonly completed: number;
  readonly notices: readonly Notice[];
}

export function missionBoardView(state: GameState, ctx: GameContext): MissionBoardView | null {
  const place = placeHere(state, ctx, 'missions');
  if (!place) return null;
  const completed = state.standing.missionsCompleted;
  return {
    name: place.name,
    completed,
    notices: place.missionIds.map((id) => {
      const m = ctx.content.missions.require(id);
      const sealed = completed < m.minMissionsCompleted;
      return {
        ...choice(state, ctx, { type: 'startMission', missionId: id }),
        id,
        title: m.title,
        client: m.client,
        summary: m.summary,
        rank: m.rank,
        ryo: m.reward.ryo,
        reputation: m.reward.reputation,
        slots: m.slots,
        energyCost: m.energyCost,
        fightLikely: m.stages.some((s) => s.kind === 'combat'),
        ...(sealed ? { opensAt: m.minMissionsCompleted } : {}),
      };
    }),
  };
}

export interface Scroll extends Choice {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly discipline: Discipline;
  readonly progress: number;
  readonly difficulty: number;
  readonly sessionsLeft: number;
  /** Unmet requirements, e.g. "Ninjutsu 7 · you have 5.0". */
  readonly needs: readonly string[];
}

export interface AcademyView {
  readonly name: string;
  readonly energyCost: number;
  readonly studying: readonly Scroll[];
  readonly ready: readonly Scroll[];
  readonly comingUp: readonly Scroll[];
}

export function academyView(state: GameState, ctx: GameContext): AcademyView | null {
  const place = placeHere(state, ctx, 'academy');
  if (!place) return null;
  const { stats } = state.character;
  const scrolls = place.techniqueIds
    .filter((id) => !state.techniques.known.includes(id))
    .map((id): Scroll => {
      const t = ctx.content.techniques.require(id);
      const progress = state.techniques.progress[id] ?? 0;
      const needs = (Object.entries(t.requirements) as [StatId, number][])
        .filter(([stat, min]) => stats[stat] < min)
        .map(
          ([stat, min]) => `${STAT_INFO[stat].label} ${min} · you have ${stats[stat].toFixed(1)}`,
        );
      return {
        ...choice(state, ctx, { type: 'study', techniqueId: id }),
        id,
        name: t.name,
        description: t.description,
        discipline: t.discipline,
        progress,
        difficulty: t.difficulty,
        sessionsLeft: Math.ceil((t.difficulty - progress) / studyPoints(stats, t)),
        needs,
      };
    });
  return {
    name: place.name,
    energyCost: STUDY_ENERGY_COST,
    studying: scrolls.filter((s) => s.progress > 0),
    ready: scrolls.filter((s) => s.progress === 0 && s.needs.length === 0),
    comingUp: scrolls.filter((s) => s.needs.length > 0),
  };
}
