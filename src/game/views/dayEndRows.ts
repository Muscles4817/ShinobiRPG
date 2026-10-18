import { counted } from '@/core';
import type { IconId } from '@/content';
import { stageForPair, stageOf } from '@/systems/bonds';
import { RANK_LABELS } from '@/systems/standing';
import {
  STAT_GRADES,
  STAT_IDS,
  STAT_INFO,
  statTier,
  type StatGrade,
  type StatId,
} from '@/systems/stats';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';
import { hungerLevel } from '@/systems/vitals';

import type { GameContext } from '../context';
import type { DayEnd, Find } from '../daybook/state';
import { entryOf } from '../fieldBook/keys';
import { findPerson } from '../people/cast';
import { mentorOf } from '../sensei/plan';
import type { GameState } from '../state';
import { bondPath } from './bondPath';
import { personFace, type PersonFace } from './people';

/**
 * The rows of the end-of-day sheet, one kind per section, each in the words its look needs:
 * moments to stamp, hurts in red, growth as a bar towards the next grade, people with what
 * getting closer opens next, finds as tiles. Only what moved gets a row.
 */

export interface DayMoment {
  readonly seal: string;
  readonly title: string;
  /** A technique's art and rank, shown as a tag in its colour. */
  readonly tag: { readonly label: string; readonly discipline: Discipline } | null;
  /** A moment in the race with your rival, inked in the rival's colour. */
  readonly rival?: true;
}

export interface DayHurt {
  readonly seal: string;
  readonly title: string;
  readonly note: string;
}

export interface DayGrowth {
  readonly stat: StatId;
  readonly name: string;
  readonly grade: StatGrade;
  /** "Genin D". */
  readonly tier: string;
  /** Through the grade at dawn and now, 0–1: the bar's dim part and today's bright share. */
  readonly from: number;
  readonly to: number;
  /** "Close to Genin D". */
  readonly words: string;
  /** A new grade today. */
  readonly up: boolean;
  /** An art's colour; null for body and mind. */
  readonly discipline: Discipline | null;
}

export interface DayPerson {
  readonly face: PersonFace;
  readonly stage: string;
  readonly progress: number;
  /** "Now friends" on a new stage; your sensei's change of mind. */
  readonly stamp: string | null;
  /** What getting closer opens next, or null at the closest there is. */
  readonly next: string | null;
}

export interface DayFind {
  readonly name: string;
  readonly count: number;
  readonly icon: IconId;
  /** Something new to you (a recipe, a scroll, a piece of gear): outlined. */
  readonly fresh: boolean;
}

const MAX_GROWTH_ROWS = 5;
/** The new field book entries named on the sheet; past these, "and others". */
const FIELD_BOOK_NAMES = 3;

function disciplineOf(stat: StatId): Discipline | null {
  return DISCIPLINES.find((d) => d === stat) ?? null;
}

function growthWords(progress: number, up: boolean, next: string | null): string {
  if (up) return 'A new grade today';
  if (!next) return 'As high as it goes';
  if (progress >= 0.85) return `Close to ${next}`;
  if (progress >= 0.5) return `Past halfway to ${next}`;
  return progress >= 0.25 ? `On the way to ${next}` : `Early in the grade`;
}

export function growthRows(ended: DayEnd): DayGrowth[] {
  const rows = (Object.entries(ended.stats) as [StatId, readonly [number, number]][])
    .filter(([, [before, after]]) => after > before)
    .sort(([, a], [, b]) => b[1] - b[0] - (a[1] - a[0]));
  return rows.slice(0, MAX_GROWTH_ROWS).map(([stat, [before, after]]) => {
    const now = statTier(after);
    const up = statTier(before).grade !== now.grade;
    return {
      stat,
      name: STAT_INFO[stat].label,
      grade: now.grade,
      tier: now.label,
      from: up ? 0 : statTier(before).progress,
      to: now.progress,
      words: growthWords(now.progress, up, now.next?.label ?? null),
      up,
      discipline: disciplineOf(stat),
    };
  });
}

/** Grades reached first today in the race with your rival, either way. */
function raceRows(ended: DayEnd, state: GameState, ctx: GameContext): DayMoment[] {
  const rival = state.rival && findPerson(state, ctx, state.rival.personId);
  if (!rival) return [];
  return (ended.rivalFirsts ?? []).flatMap(({ key, who }) => {
    const [name, index] = key.split(':');
    const stat = STAT_IDS.find((id) => id === name);
    const grade = STAT_GRADES[Number(index)];
    if (!grade || !stat) return [];
    const what = `${STAT_INFO[stat].label} ${grade}`;
    const title =
      who === 'you'
        ? `You reached ${what} before ${rival.name}`
        : `${rival.name} reached ${what} before you`;
    return [{ seal: '競', title, tag: null, rival: true as const }];
  });
}

/** What a field book key names: the fish, the find, the sight's title, the foe. */
function entryName(key: string, ctx: GameContext): string | null {
  const entry = entryOf(key);
  if (!entry) return null;
  const { content } = ctx;
  switch (entry.kind) {
    case 'fish':
    case 'find':
      return content.ingredients.get(entry.id)?.name ?? null;
    case 'sight':
      return content.village.sights.find((s) => s.id === entry.id)?.title ?? null;
    case 'foe':
      return content.enemies.get(entry.id)?.name ?? null;
  }
}

/** One line for the day's new entries, however many: the first few by name. */
function fieldBookRows(ended: DayEnd, ctx: GameContext): DayMoment[] {
  const names = (ended.fieldBook ?? []).flatMap((key) => entryName(key, ctx) ?? []);
  if (names.length === 0) return [];
  const shown = names.slice(0, FIELD_BOOK_NAMES).join(', ');
  const list = names.length > FIELD_BOOK_NAMES ? `${shown} and others` : shown;
  return [{ seal: '記', title: `New in your field book: ${list}`, tag: null }];
}

export function momentRows(ended: DayEnd, state: GameState, ctx: GameContext): DayMoment[] {
  const rank = ended.rank
    ? [{ seal: '昇', title: `Promoted to ${RANK_LABELS[ended.rank]}`, tag: null }]
    : [];
  const learned = ended.learned.flatMap((id) => {
    const t = ctx.content.techniques.get(id);
    if (!t) return [];
    const label = `${STAT_INFO[t.discipline].label}, rank ${t.rank}`;
    return [
      { seal: '術', title: `You learned ${t.name}`, tag: { label, discipline: t.discipline } },
    ];
  });
  const grades = growthRows(ended)
    .filter((g) => g.up)
    .map((g) => ({
      seal: '級',
      title: `Your ${g.name.toLowerCase()} reached ${g.tier}`,
      tag: null,
    }));
  const jobs = ended.jobs.map((title) => ({ seal: '良', title: `${title}, done`, tag: null }));
  return [
    ...rank,
    ...learned,
    ...grades,
    ...raceRows(ended, state, ctx),
    ...jobs,
    ...fieldBookRows(ended, ctx),
  ];
}

function nights(n: number): string {
  return `Mends after ${counted(n, 'more night', 'more nights')}`;
}

export function hurtRows(ended: DayEnd, state: GameState, ctx: GameContext): DayHurt[] {
  const wounds = ended.injuries.flatMap((id) => {
    const def = ctx.content.injuries.get(id);
    const carried = state.character.injuries.find((i) => i.injuryId === id);
    if (!def || !carried) return [];
    return [
      { seal: '傷', title: def.name, note: nights(Math.max(1, carried.until - state.time.day)) },
    ];
  });
  const [before, after] = ended.satiety;
  const level = hungerLevel({ satiety: after });
  const hungry =
    after < before && (level === 'hungry' || level === 'starving')
      ? [
          {
            seal: '飢',
            title: level === 'starving' ? 'Starving' : 'Hungry',
            note: 'Eat before you train hard.',
          },
        ]
      : [];
  const sleepless = ended.slept
    ? []
    : [{ seal: '眠', title: 'No sleep', note: 'Your energy didn’t come back overnight.' }];
  return [...wounds, ...hungry, ...sleepless];
}

function nextStep(state: GameState, ctx: GameContext, personId: string): string | null {
  const person = findPerson(state, ctx, personId);
  const next = person ? bondPath(state, person).next : null;
  if (!next) return null;
  const opens = next.opens[0];
  const stage = next.name.toLowerCase();
  return opens
    ? `At ${stage}: ${opens.charAt(0).toLowerCase()}${opens.slice(1)}`
    : `Next: ${stage}`;
}

function regardStamp(ended: DayEnd, personId: string, state: GameState, ctx: GameContext) {
  if (!ended.regard || mentorOf(state, ctx)?.id !== personId) return null;
  return ended.regard[1] > ended.regard[0] ? 'Thinks better of you' : 'Thinks less of you';
}

export function peopleRows(ended: DayEnd, state: GameState, ctx: GameContext): DayPerson[] {
  const sensei = mentorOf(state, ctx);
  const ids = Object.keys(ended.bonds);
  const all = ended.regard && sensei && !ids.includes(sensei.id) ? [sensei.id, ...ids] : ids;
  return all.flatMap((id) => {
    const person = findPerson(state, ctx, id);
    if (!person) return [];
    const path = bondPath(state, person);
    const [before, after] = ended.bonds[id] ?? [0, 0];
    const rose = stageOf(after) > stageOf(before);
    const stamp = rose ? `Now ${stageForPair(path.stage)}` : regardStamp(ended, id, state, ctx);
    return [
      {
        face: personFace(state, person),
        stage: path.name,
        progress: path.progress,
        stamp,
        next: nextStep(state, ctx, id),
      },
    ];
  });
}

function findRow(find: Find, ctx: GameContext): DayFind | null {
  const { content } = ctx;
  switch (find.kind) {
    case 'ingredient': {
      const def = content.ingredients.get(find.id);
      return def ? { name: def.name, count: find.count, icon: def.icon, fresh: false } : null;
    }
    case 'tool': {
      const def = content.tools.get(find.id);
      return def ? { name: def.name, count: find.count, icon: def.icon, fresh: false } : null;
    }
    case 'gear': {
      const def = content.gear.get(find.id);
      return def ? { name: def.name, count: 1, icon: def.icon, fresh: true } : null;
    }
    case 'scroll': {
      const def = content.techniques.get(find.id);
      return def ? { name: `Scroll: ${def.name}`, count: 1, icon: 'scroll', fresh: true } : null;
    }
    case 'recipe': {
      const def = content.recipes.get(find.id);
      return def ? { name: `Recipe: ${def.name}`, count: 1, icon: 'bowl', fresh: true } : null;
    }
  }
}

export function findRows(ended: DayEnd, ctx: GameContext): DayFind[] {
  return ended.finds.flatMap((f) => findRow(f, ctx) ?? []);
}
