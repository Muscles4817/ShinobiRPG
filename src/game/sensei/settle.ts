import type { PersonDef, SenseiGrip } from '@/content';
import { write, type NewEntry } from '@/systems/journal';
import { slotName, TIME_SLOTS, weekOf } from '@/systems/time';

import type { GameContext } from '../context';
import { laidUp } from '../injuries';
import type { GameState } from '../state';
import { meetingOn, mentorOf, teamDayOf, teamKey, type Meeting } from './plan';
import { withRegard, type MeetingOutcome, type Mentor } from './state';
import { waysOf } from './generate';

/**
 * Settles the planned meetings of the days that have ended, as each new day begins: a lesson
 * is kept if you had it that week by then, a short session if you came; you are excused if
 * you were out on a job, away from the village or laid up; otherwise it is missed, and your
 * sensei's regard drops by how tight a grip they keep. Then, if they expect you today, a line
 * says so.
 */

/** Regard lost for a missed meeting, by grip. */
export const MISSED_REGARD: Readonly<Record<SenseiGrip, number>> = {
  tight: 6,
  firm: 4,
  loose: 2,
};
/** Regard for a weekly lesson had by its planned day. */
export const LESSON_KEPT_REGARD = 4;

const MISSED_LINES: Readonly<Record<SenseiGrip, string>> = {
  tight: '{name} waited at the training ground until dark. You will hear about it.',
  firm: '{name} waited at the training ground. You didn’t come.',
  loose: '{name} shrugged when you didn’t turn up, but noticed.',
};

function lessonHad(state: GameState, sensei: PersonDef, day: number): boolean {
  const record = state.people.taught[sensei.id];
  return record?.week === weekOf(day) && record.lastDay <= day;
}

function excused(state: GameState, ctx: GameContext): boolean {
  return (
    state.mission !== null ||
    state.locationId !== ctx.content.startLocationId ||
    laidUp(state, ctx) !== null
  );
}

function outcomeOf(state: GameState, ctx: GameContext, sensei: PersonDef, meeting: Meeting) {
  const kept =
    meeting.kind === 'lesson'
      ? lessonHad(state, sensei, meeting.day)
      : state.mentor.outcomes[meeting.day] === 'kept';
  if (kept) return 'kept';
  return excused(state, ctx) ? 'excused' : 'missed';
}

function logLine(state: GameState, entry: NewEntry): GameState {
  return { ...state, journal: write(state.journal, state.time, entry) };
}

function settleDay(state: GameState, ctx: GameContext, sensei: PersonDef, day: number): GameState {
  const meeting = meetingOn(state, sensei, day);
  if (!meeting) return state;
  const outcome: MeetingOutcome = outcomeOf(state, ctx, sensei, meeting);
  const grip = waysOf(sensei)?.grip ?? 'firm';
  const delta =
    outcome === 'missed'
      ? -MISSED_REGARD[grip]
      : outcome === 'kept' && meeting.kind === 'lesson'
        ? LESSON_KEPT_REGARD
        : 0;
  const mentor: Mentor = withRegard(
    { ...state.mentor, outcomes: { ...state.mentor.outcomes, [day]: outcome } },
    delta,
  );
  const settled = { ...state, mentor };
  if (outcome !== 'missed') return settled;
  return logLine(settled, {
    text: MISSED_LINES[grip].replace('{name}', sensei.name),
    tone: 'warning',
    chips: [{ label: `${sensei.name}’s regard falls`, tone: 'cost' }],
  });
}

const TEAM_MISSED = '{name} and the team went ahead without you.';

/** A team day: kept if you came, excused or missed as a meeting is. */
function settleTeamDay(state: GameState, ctx: GameContext, sensei: PersonDef, day: number) {
  const teamDay = teamDayOf(state, sensei, weekOf(day));
  const key = teamKey(day);
  if (teamDay?.day !== day || state.mentor.outcomes[key] === 'kept') return state;
  const outcome: MeetingOutcome = excused(state, ctx) ? 'excused' : 'missed';
  const grip = waysOf(sensei)?.grip ?? 'firm';
  const delta = outcome === 'missed' ? -MISSED_REGARD[grip] : 0;
  const mentor = withRegard(
    { ...state.mentor, outcomes: { ...state.mentor.outcomes, [key]: outcome } },
    delta,
  );
  if (outcome !== 'missed') return { ...state, mentor };
  return logLine(
    { ...state, mentor },
    {
      text: TEAM_MISSED.replace('{name}', sensei.name),
      tone: 'warning',
      chips: [{ label: `${sensei.name}’s regard falls`, tone: 'cost' }],
    },
  );
}

/** The day an outcome's key stands for: a meeting's day, or a team day's (`t12`). */
function keyDay(key: string): number {
  return Number(key.startsWith('t') ? key.slice(1) : key);
}

/** Only this week's outcomes are kept, for the slip. */
function thisWeek(mentor: Mentor, day: number): Mentor {
  const week = weekOf(day);
  const outcomes = Object.fromEntries(
    Object.entries(mentor.outcomes).filter(([key]) => weekOf(keyDay(key)) === week),
  );
  return { ...mentor, outcomes };
}

function expectedToday(state: GameState, ctx: GameContext, sensei: PersonDef): GameState {
  const meeting = meetingOn(state, sensei, state.time.day);
  if (!meeting) return state;
  const place = ctx.content.locations
    .require(ctx.content.startLocationId)
    .places.find((p) => p.kind === 'training');
  const what = meeting.kind === 'lesson' ? 'for your lesson' : 'for a session';
  const when = TIME_SLOTS.indexOf(meeting.from) === 0 ? 'this morning' : `from ${meeting.from}`;
  return logLine(state, {
    text: `${sensei.name} expects you at ${place?.name ?? 'the training ground'} ${what}, ${when}.`,
    tone: 'info',
  });
}

/** Called as each new day begins (`spendTime`). */
export function settleMentor(state: GameState, ctx: GameContext): GameState {
  const today = state.time.day;
  const sensei = mentorOf(state, ctx);
  if (!sensei) return { ...state, mentor: { ...state.mentor, settledDay: today - 1 } };
  let settled = state;
  for (let day = state.mentor.settledDay + 1; day < today; day += 1) {
    settled = settleTeamDay(settleDay(settled, ctx, sensei, day), ctx, sensei, day);
  }
  const mentor = thisWeek({ ...settled.mentor, settledDay: today - 1 }, today);
  const next = { ...settled, mentor };
  return slotName(state.time) === 'morning' ? expectedToday(next, ctx, sensei) : next;
}
