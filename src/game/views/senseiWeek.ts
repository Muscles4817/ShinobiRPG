import type { RitualKind } from '@/content';
import { STAT_INFO } from '@/systems/stats';
import { calendarDay, DAYS_PER_WEEK, TIME_SLOTS, weekOf } from '@/systems/time';

import type { GameContext } from '../context';
import { beatDue } from '../sensei/curriculum';
import {
  meetingsPerWeek,
  mentorOf,
  teamDayOf,
  teamKey,
  weekPlan,
  weekStart,
  type Meeting,
} from '../sensei/plan';
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
  /** The team day's kind ("Meal"), if the team meets that day, and how it went. */
  readonly team: string | null;
  readonly teamOutcome: MeetingOutcome | null;
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
  /** The work they set at the last lesson, and how far along it is, in words. */
  readonly assignment: { readonly stat: string; readonly progress: string } | null;
  /** Today's team day, if it is today: when, and the choice to join. */
  readonly teamDay: { readonly what: string; readonly from: string; readonly join: Choice } | null;
  /** Something they want to show you today (the curriculum), and the choice to hear it. */
  readonly lesson: { readonly title: string; readonly text: string; readonly heed: Choice } | null;
}

function progressWord(share: number): string {
  if (share >= 1) return 'done, show them at the lesson';
  if (share >= 2 / 3) return 'nearly there';
  if (share >= 1 / 3) return 'under way';
  return 'barely started';
}

function assignmentLine(state: GameState): SenseiWeekView['assignment'] {
  const work = state.character.assignment;
  if (!work) return null;
  const done = state.character.stats[work.stat] - work.from;
  return {
    stat: STAT_INFO[work.stat].label,
    progress: progressWord(done / Math.max(1e-9, work.target - work.from)),
  };
}

const RITUAL_LABELS: Readonly<Record<RitualKind, string>> = {
  meal: 'Team meal',
  challenge: 'A challenge',
  tea: 'Tea',
  debrief: 'Debrief',
  camp: 'A camp',
};

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

function lessonToday(state: GameState, ctx: GameContext, name: string): SenseiWeekView['lesson'] {
  const beat = beatDue(state, ctx);
  if (!beat) return null;
  return {
    title: beat.title,
    text: beat.text.replaceAll('{sensei}', name),
    heed: choice(state, ctx, { type: 'heedSensei' }),
  };
}

export function senseiWeekView(state: GameState, ctx: GameContext): SenseiWeekView | null {
  const sensei = mentorOf(state, ctx);
  const ways = sensei?.sensei?.ways;
  if (!sensei || !ways) return null;
  const week = weekOf(state.time.day);
  const plan = weekPlan(state, sensei, week);
  const today = plan.find((m) => m.day === state.time.day);
  const team = teamDayOf(state, sensei, week);
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
      team: team?.day === day ? RITUAL_LABELS[team.ritual.kind] : null,
      teamOutcome: state.mentor.outcomes[teamKey(day)] ?? null,
    };
  });
  return {
    sensei: sensei.name,
    regard: regardWord(state.mentor.regard),
    days,
    eased: meetingsPerWeek(state, sensei) < ways.cadence.sessions,
    todayLine: todayLine(state, today),
    session: today?.kind === 'session' ? choice(state, ctx, { type: 'senseiSession' }) : null,
    assignment: assignmentLine(state),
    lesson: lessonToday(state, ctx, sensei.name),
    teamDay:
      team?.day === state.time.day && state.mentor.outcomes[teamKey(team.day)] !== 'kept'
        ? {
            what: RITUAL_LABELS[team.ritual.kind],
            from: team.from,
            join: choice(state, ctx, { type: 'teamDay' }),
          }
        : null,
  };
}
