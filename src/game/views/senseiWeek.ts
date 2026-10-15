import { calendarDay, DAYS_PER_WEEK, TIME_SLOTS, weekOf } from '@/systems/time';

import type { GameContext } from '../context';
import { meetingsPerWeek, mentorOf, weekPlan, weekStart, type Meeting } from '../sensei/plan';
import { FORMAT_LABELS } from '../sensei/sessions';
import { regardWord, type MeetingOutcome } from '../sensei/state';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/**
 * The slip your sensei hands you at the weekly lesson: the week's days, what they planned on
 * each and how it went, how they rate you in a word, and today's session if there is one.
 */

export interface SenseiWeekDay {
  readonly day: number;
  /** The day of the season, e.g. "12". */
  readonly label: string;
  readonly today: boolean;
  /** "Lesson", "Sparring", or null on a free day. */
  readonly meeting: string | null;
  /** "morning": when they come. */
  readonly from: string | null;
  readonly outcome: MeetingOutcome | null;
}

export interface SenseiWeekView {
  readonly sensei: string;
  /** How they rate you, in a word or two ("Watching you"). */
  readonly regard: string;
  readonly days: readonly SenseiWeekDay[];
  /** They have eased off: you are close enough that they plan less. */
  readonly eased: boolean;
  /** What they expect of you today, in a sentence, or null on a free day. */
  readonly todayLine: string | null;
  /** Today's short session, with why not when it can't be had. */
  readonly session: Choice | null;
}

function meetingName(meeting: Meeting): string {
  return meeting.kind === 'lesson' ? 'Lesson' : FORMAT_LABELS[meeting.format];
}

function todayLine(state: GameState, meeting: Meeting | undefined): string | null {
  if (!meeting) return null;
  if (state.mentor.outcomes[meeting.day] === 'kept') return 'Done for today.';
  const slot = TIME_SLOTS.indexOf(meeting.from);
  const what = meeting.kind === 'lesson' ? 'Your lesson' : meetingName(meeting);
  return state.time.slot < slot
    ? `${what} today, from ${meeting.from}, at the training ground.`
    : `${what} now, at the training ground.`;
}

export function senseiWeekView(state: GameState, ctx: GameContext): SenseiWeekView | null {
  const sensei = mentorOf(state, ctx);
  const ways = sensei?.sensei?.ways;
  if (!sensei || !ways) return null;
  const week = weekOf(state.time.day);
  const plan = weekPlan(state, sensei, week);
  const today = plan.find((m) => m.day === state.time.day);
  const days = Array.from({ length: DAYS_PER_WEEK }, (_, offset): SenseiWeekDay => {
    const day = weekStart(week) + offset;
    const meeting = plan.find((m) => m.day === day);
    return {
      day,
      label: String(calendarDay(day).day),
      today: day === state.time.day,
      meeting: meeting ? meetingName(meeting) : null,
      from: meeting?.from ?? null,
      outcome: state.mentor.outcomes[day] ?? null,
    };
  });
  return {
    sensei: sensei.name,
    regard: regardWord(state.mentor.regard),
    days,
    eased: meetingsPerWeek(state, sensei) < ways.cadence.sessions,
    todayLine: todayLine(state, today),
    session: today?.kind === 'session' ? choice(state, ctx, { type: 'senseiSession' }) : null,
  };
}
