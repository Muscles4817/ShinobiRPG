import { STAT_INFO, type StatId } from '@/systems/stats';

import { STUDY_ENERGY_COST } from '../actions/study';
import { availability } from '../board';
import type { GameContext } from '../context';
import { studyPointsFor } from '../profile';
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
  /** Your teammates come along. */
  readonly withTeam: boolean;
  /** "Standing job" or how long the posting stays up, e.g. "Gone after tomorrow". */
  readonly posted: string;
  readonly standing: boolean;
}

export interface MissionBoardView {
  readonly name: string;
  readonly completed: number;
  readonly notices: readonly Notice[];
}

/** How long a posting stays up, in words. */
function postedFor(daysLeft: number): string {
  if (daysLeft <= 1) return 'Last day';
  if (daysLeft === 2) return 'Gone after tomorrow';
  return `Up for ${daysLeft} days`;
}

export function missionBoardView(state: GameState, ctx: GameContext): MissionBoardView | null {
  const place = placeHere(state, ctx, 'missions');
  if (!place) return null;
  const completed = state.standing.missionsCompleted;
  return {
    name: place.name,
    completed,
    notices: place.missionIds.flatMap((id) => {
      const m = ctx.content.missions.require(id);
      const on = availability(state, ctx, m);
      if (on.kind === 'absent') return [];
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
        withTeam: m.withTeam ?? false,
        standing: on.kind === 'standing',
        posted: on.kind === 'standing' ? 'Standing job' : postedFor(on.daysLeft),
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
  /** A technique only your clan teaches. */
  readonly fromClan: boolean;
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
    .filter((id) => {
      const clan = ctx.content.techniques.require(id).clan;
      return (
        !state.techniques.known.includes(id) &&
        (clan === undefined || clan === state.character.clanId)
      );
    })
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
        sessionsLeft: Math.ceil(
          (t.difficulty - progress) / studyPointsFor(state.character, t, ctx),
        ),
        needs,
        fromClan: t.clan !== undefined,
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
