import { daysOfRentLeft, isRentFree, isRentOverdue } from '@/systems/housing';

import type { GameContext } from '../context';
import { findPerson } from '../people/cast';
import type { GameState } from '../state';
import { festivalNotice, rumoursToday } from '../village';
import { examNotice } from './examNotice';
import { senseiWeekView } from './senseiWeek';

/**
 * What the day ahead holds, for the plaques at the foot of the end-of-day sheet (and the morning
 * slip): the reasons to come back. Read from the same rules that run the day (your sensei's
 * week, the calendar, the board, the gossip, your rent and your wounds), most pressing first.
 */

export interface DayHook {
  /** One character, inked on the plaque. */
  readonly glyph: string;
  /** A few words: a plaque is narrow. */
  readonly text: string;
  /** A stamp: when, or why it matters. */
  readonly stamp: string | null;
  /** Inked in red: something that needs you. */
  readonly warm: boolean;
}

/** The sheet shows this many; the first is lit. */
export const HOOKS_SHOWN = 3;
/** A festival or exam is worth a plaque this many days ahead. */
const SOON_DAYS = 7;

function capitalised(word: string | null): string | null {
  return word ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : null;
}

const hook = (glyph: string, text: string, stamp: string | null = null, warm = false): DayHook => ({
  glyph,
  text,
  stamp,
  warm,
});

function rivalry(state: GameState, ctx: GameContext): DayHook[] {
  const rival = state.rival;
  const person = rival?.challenge && findPerson(state, ctx, rival.personId);
  return person ? [hook('競', `${person.name} challenged you to a spar`, 'Rival', true)] : [];
}

function wounds(state: GameState): DayHook[] {
  return state.character.injuries.length > 0
    ? [hook('医', 'Rest, or see the healer', 'Hurt', true)]
    : [];
}

function exam(state: GameState, ctx: GameContext): DayHook[] {
  const notice = examNotice(state, ctx);
  return notice ? [hook('試', notice.name, notice.when, notice.today)] : [];
}

function festival(state: GameState, ctx: GameContext): DayHook[] {
  const notice = festivalNotice(state, ctx);
  if (!notice || notice.daysAway > SOON_DAYS) return [];
  const when = notice.daysAway === 0 ? 'Today' : `In ${notice.daysAway} days`;
  return [hook('祭', notice.festival.name, when, notice.daysAway === 0)];
}

function sensei(state: GameState, ctx: GameContext): DayHook[] {
  const week = senseiWeekView(state, ctx);
  const today = week?.days.find((d) => d.today);
  if (!week || !today) return [];
  const meeting = today.meeting
    ? [hook('師', `${week.sensei} sets ${today.meeting.toLowerCase()}`, capitalised(today.from))]
    : [];
  const team = today.team ? [hook('班', `Team day: ${today.team.toLowerCase()}`)] : [];
  return [...meeting, ...team];
}

function work(state: GameState, ctx: GameContext): DayHook[] {
  const fresh = state.board.postings.some((p) => p.postedDay === state.time.day);
  const rumoured = rumoursToday(state, ctx).flatMap((r) => {
    const job = r.missionId ? ctx.content.missions.get(r.missionId) : undefined;
    return job ? [hook('噂', job.title, 'Soon')] : [];
  });
  return [...(fresh ? [hook('依', 'New work at the hall', 'New', true)] : []), ...rumoured];
}

function rent(state: GameState): DayHook[] {
  const { housing } = state;
  if (isRentFree(housing)) return [];
  if (isRentOverdue(housing, state.time.day))
    return [hook('家', 'Your rent is overdue', null, true)];
  return daysOfRentLeft(housing, state.time.day) === 0
    ? [hook('家', 'Rent falls due', 'Tomorrow', true)]
    : [];
}

const FREE_DAY = hook('道', 'A free day: train, cook or wander');

/** The day ahead's plaques, most pressing first; never empty. */
export function dayHooks(state: GameState, ctx: GameContext): DayHook[] {
  const all = [
    ...rivalry(state, ctx),
    ...wounds(state),
    ...exam(state, ctx),
    ...sensei(state, ctx),
    ...festival(state, ctx),
    ...work(state, ctx),
    ...rent(state),
  ];
  return (all.length > 0 ? all : [FREE_DAY]).slice(0, HOOKS_SHOWN);
}
