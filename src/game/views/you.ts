import type { JournalChip, JournalTone } from '@/systems/journal';
import { RANK_LABELS } from '@/systems/standing';
import { round1 } from '@/core';
import { STAT_IDS, STAT_INFO, type StatGroup } from '@/systems/stats';
import { formatDate, slotName } from '@/systems/time';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import type { Discipline } from './common';

export interface JutsuCard {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly discipline: Discipline;
  readonly element: string | null;
  readonly effect: 'damage' | 'stun' | 'heal';
  readonly chakraCost: number;
  readonly power: number;
  readonly status: 'known' | 'studying' | 'unknown';
  readonly progressPct: number;
}

/** Every technique in the setting: known ones first, then those being studied. */
export function jutsuDeck(state: GameState, ctx: GameContext): readonly JutsuCard[] {
  const order = { known: 0, studying: 1, unknown: 2 } as const;
  return ctx.content.techniques.all
    .map((t): JutsuCard => {
      const progress = state.techniques.progress[t.id] ?? 0;
      const known = state.techniques.known.includes(t.id);
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        discipline: t.discipline,
        element: t.element ?? null,
        effect: t.effect,
        chakraCost: t.chakraCost,
        power: t.power,
        status: known ? 'known' : progress > 0 ? 'studying' : 'unknown',
        progressPct: known ? 100 : Math.round((progress / t.difficulty) * 100),
      };
    })
    .sort((a, b) => order[a.status] - order[b.status]);
}

export interface StatLine {
  readonly label: string;
  readonly value: number;
  /** Growth since graduation. */
  readonly growth: number;
}

export interface ShinobiView {
  readonly name: string;
  readonly rank: string;
  readonly village: string;
  readonly gift: string;
  readonly registryNo: string;
  readonly issued: string;
  readonly missionsCompleted: number;
  readonly missionsFailed: number;
  readonly reputation: number;
  readonly groups: readonly { readonly group: StatGroup; readonly stats: readonly StatLine[] }[];
}

/** A stable registry number derived from the name, so it never changes between visits. */
function registryNumber(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 9000;
  return String(1000 + hash);
}

export function shinobiView(state: GameState, ctx: GameContext): ShinobiView {
  const { stats, startingStats } = state.character;
  const groups: StatGroup[] = ['discipline', 'body', 'mind'];
  return {
    name: state.character.name,
    rank: RANK_LABELS[state.standing.rank],
    village: ctx.content.locations.require(ctx.content.startLocationId).name,
    gift: ctx.content.aptitudes.get(state.character.aptitudeId)?.name ?? 'Unknown',
    registryNo: registryNumber(state.character.name),
    issued: formatDate({ day: 1, slot: 0 }),
    missionsCompleted: state.standing.missionsCompleted,
    missionsFailed: state.standing.missionsFailed,
    reputation: state.standing.reputation,
    groups: groups.map((group) => ({
      group,
      stats: STAT_IDS.filter((id) => STAT_INFO[id].group === group).map((id) => ({
        label: STAT_INFO[id].label,
        value: stats[id],
        growth: round1(stats[id] - startingStats[id]),
      })),
    })),
  };
}

export interface RecordLine {
  readonly id: number;
  readonly when: string;
  readonly heading: string | null;
  readonly text: string;
  readonly tone: JournalTone;
  readonly chips: readonly JournalChip[];
}

export interface RecordDay {
  readonly date: string;
  readonly lines: readonly RecordLine[];
}

/** The record, oldest day first and oldest entry first within a day (a feed reads down). */
export function recordView(state: GameState): readonly RecordDay[] {
  const days = new Map<number, RecordLine[]>();
  for (const e of state.journal.entries) {
    const lines = days.get(e.day) ?? [];
    lines.push({
      id: e.id,
      when: slotName({ day: e.day, slot: e.slot }),
      heading: e.heading ?? null,
      text: e.text,
      tone: e.tone,
      chips: e.chips ?? [],
    });
    days.set(e.day, lines);
  }
  return [...days].map(([day, lines]) => ({ date: formatDate({ day, slot: 0 }), lines }));
}
