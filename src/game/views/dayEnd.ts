import { listed } from '@/core';
import { formatDate } from '@/systems/time';

import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import type { DayEnd, DayEndMode, PurseLine } from '../daybook/state';
import type { GameState } from '../state';
import { diaryLine } from './dayDiary';
import { growthRows, type DayGrowth } from './dayEndGrowth';
import { dayHooks, type DayHook } from './dayHooks';
import {
  findRows,
  hurtRows,
  momentRows,
  peopleRows,
  type DayFind,
  type DayHurt,
  type DayMoment,
  type DayPerson,
} from './dayEndRows';

/**
 * The end-of-day sheet: the day that ended, section by section (only the sections something
 * happened in), and the plaques for the day ahead. A bed closes it with "Sleep"; a night pushed
 * through closes at dawn, says so, and calls the day ahead "Today".
 */

export interface DayEndView {
  readonly mode: Exclude<DayEndMode, 'off'>;
  readonly slept: boolean;
  /** "Spring 9 draws to a close". */
  readonly when: string;
  /** One sentence about the day, as in a diary. */
  readonly title: string;
  readonly moments: readonly DayMoment[];
  readonly hurts: readonly DayHurt[];
  readonly growth: readonly DayGrowth[];
  readonly people: readonly DayPerson[];
  readonly finds: readonly DayFind[];
  readonly purse: { readonly lines: readonly PurseLine[]; readonly left: number } | null;
  /** "Tomorrow" after a night's sleep; "Today" at a dawn you stayed up for. */
  readonly aheadLabel: string;
  readonly ahead: readonly DayHook[];
  /** The morning slip's few lines about the day before. */
  readonly summary: readonly string[];
  readonly button: string;
  readonly dismiss: GameAction;
}

const SUMMARY_LINES = 3;

/** "Spring 9", from "Year 1, Spring 9". */
function dayName(day: number): string {
  return formatDate({ day, slot: 0 }).replace(/^Year \d+, /, '');
}

function whenLine(ended: DayEnd): string {
  if (!ended.slept) return `${dayName(ended.day)} ran on into ${dayName(ended.day + 1)}`;
  if (ended.days > 1) return `${dayName(ended.day)} to ${dayName(ended.day + ended.days - 1)}`;
  return `${dayName(ended.day)} draws to a close`;
}

interface Sections {
  readonly moments: readonly DayMoment[];
  readonly hurts: readonly DayHurt[];
  readonly growth: readonly DayGrowth[];
  readonly people: readonly DayPerson[];
}

/**
 * The people rows' stamps as lines: everyone who reached a stage together ("Now friends with
 * Goro and Asuka"), then a sensei's change of mind ("Gōran thinks better of you").
 */
function peopleLines(people: readonly DayPerson[]): string[] {
  const closer = new Map<string, string[]>();
  const others: string[] = [];
  for (const p of people) {
    if (p.stamp?.startsWith('Now '))
      closer.set(p.stamp, [...(closer.get(p.stamp) ?? []), p.face.name]);
    else if (p.stamp)
      others.push(`${p.face.name} ${p.stamp.charAt(0).toLowerCase()}${p.stamp.slice(1)}`);
  }
  return [...[...closer].map(([stamp, names]) => `${stamp} with ${listed(names)}`), ...others];
}

function summaryOf(s: Sections): string[] {
  return [
    ...s.moments.map((m) => m.title),
    ...s.hurts.map((h) => h.title),
    ...peopleLines(s.people),
    ...s.growth.map((g) => `${g.name}, ${g.words.charAt(0).toLowerCase()}${g.words.slice(1)}`),
  ].slice(0, SUMMARY_LINES);
}

/** The sheet (or slip) for the day that last ended, or null when there is none to show. */
export function dayEndView(state: GameState, ctx: GameContext): DayEndView | null {
  const ended = state.daybook.ended;
  const mode = state.settings.dayEnd ?? 'full';
  if (!ended || mode === 'off') return null;
  const sections: Sections = {
    moments: momentRows(ended, state, ctx),
    hurts: hurtRows(ended, state, ctx),
    growth: growthRows(ended),
    people: peopleRows(ended, state, ctx),
  };
  return {
    mode,
    slept: ended.slept,
    when: whenLine(ended),
    title: diaryLine(ended, sections, ctx),
    ...sections,
    finds: findRows(ended, ctx),
    purse: ended.purse,
    aheadLabel: ended.slept ? 'Tomorrow' : 'Today',
    ahead: dayHooks(state, ctx),
    summary: summaryOf(sections),
    button: ended.slept ? 'Sleep' : 'Carry on',
    dismiss: { type: 'dismissDay' },
  };
}
