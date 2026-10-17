import { formatDate } from '@/systems/time';

import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import type { DayEnd, DayEndMode, PurseLine } from '../daybook/state';
import type { GameState } from '../state';
import { dayHooks, type DayHook } from './dayHooks';
import {
  findRows,
  growthRows,
  hurtRows,
  momentRows,
  peopleRows,
  type DayFind,
  type DayGrowth,
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

/** The day's name: the biggest thing that happened in it. */
function titleOf(ended: DayEnd, s: Sections): string {
  if (!ended.slept) return 'Dawn, and no sleep';
  if (ended.days > 1) return 'The days in bed';
  if (ended.rank) return 'A new rank';
  if (ended.learned.length > 0) return 'A day to remember';
  if (ended.jobs.length > 0) return 'Back from the job';
  if (ended.injuries.length > 0) return 'Home, bruised';
  if (s.growth.some((g) => g.up)) return 'A step up';
  if (s.people.some((p) => p.stamp?.startsWith('Now'))) return 'Closer to someone';
  return s.growth.length > 0 ? 'Hard work' : 'A quiet day';
}

/** A phrase carried on after a colon: its first letter lowered, names left as they are. */
function after(phrase: string): string {
  return `${phrase.charAt(0).toLowerCase()}${phrase.slice(1)}`;
}

function summaryOf(s: Sections): string[] {
  return [
    ...s.moments.map((m) => m.title),
    ...s.hurts.map((h) => h.title),
    ...s.people.flatMap((p) => (p.stamp ? [`${p.face.name}: ${after(p.stamp)}`] : [])),
    ...s.growth.map((g) => `${g.name}: ${after(g.words)}`),
  ].slice(0, SUMMARY_LINES);
}

/** The sheet (or slip) for the day that last ended, or null when there is none to show. */
export function dayEndView(state: GameState, ctx: GameContext): DayEndView | null {
  const ended = state.daybook.ended;
  const mode = state.settings.dayEnd ?? 'full';
  if (!ended || mode === 'off') return null;
  const sections: Sections = {
    moments: momentRows(ended, ctx),
    hurts: hurtRows(ended, state, ctx),
    growth: growthRows(ended),
    people: peopleRows(ended, state, ctx),
  };
  return {
    mode,
    slept: ended.slept,
    when: whenLine(ended),
    title: titleOf(ended, sections),
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
