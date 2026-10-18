import type { PersonDef, SenseiGrip, SenseiSpeech } from '@/content';
import { fillSlots } from '@/core';
import { write, type NewEntry } from '@/systems/journal';
import { slotName, weekOf, type TimeSlot } from '@/systems/time';

import type { GameContext } from '../context';
import { laidUp } from '../injuries';
import { personSlots } from '../people/pronouns';
import { placeInSentence } from '../placeName';
import type { GameState } from '../state';
import { tellFresh } from '../telling';
import { meetingOn, mentorOf, teamDayOf, teamKey, type Meeting } from './plan';
import { withAttendance, withRegard, type MeetingOutcome, type Mentor } from './state';
import { waysOf } from './generate';

/**
 * Settles the planned meetings of the days that have ended, as each new day begins: a lesson
 * is kept if you had it that week by then, a short session if you came; you are excused if
 * you were out on a job, away from the village or laid up; otherwise it is missed, and your
 * sensei's regard drops by how tight a grip they keep. Then, if they expect you today, a line
 * says so. What they have to say waits in `mentor.notices` until the action that brought the
 * morning has been told (`flushMentorNotices`, from `dispatch`), so a night's sleep reads
 * before the morning it wakes you to.
 */

/** Regard lost for a missed meeting, by grip. */
export const MISSED_REGARD: Readonly<Record<SenseiGrip, number>> = {
  tight: 6,
  firm: 4,
  loose: 2,
};
/** Regard for a weekly lesson had by its planned day. */
export const LESSON_KEPT_REGARD = 4;

/** When a meeting starts, as a phrase for the morning's note. */
const WHEN: Readonly<Record<TimeSlot, string>> = {
  morning: 'this morning',
  afternoon: 'this afternoon',
  evening: 'this evening',
  night: 'tonight',
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

/** Whether you have kept a planned meeting yet: had the week's lesson by then, or come. */
export function meetingKept(state: GameState, sensei: PersonDef, meeting: Meeting): boolean {
  return meeting.kind === 'lesson'
    ? lessonHad(state, sensei, meeting.day)
    : state.mentor.outcomes[meeting.day] === 'kept';
}

function outcomeOf(state: GameState, ctx: GameContext, sensei: PersonDef, meeting: Meeting) {
  if (meetingKept(state, sensei, meeting)) return 'kept';
  return excused(state, ctx) ? 'excused' : 'missed';
}

/** Where your sensei meets you, as it reads mid-sentence. */
export function meetingPlace(ctx: GameContext): string {
  const place = ctx.content.locations
    .require(ctx.content.startLocationId)
    .places.find((p) => p.kind === 'training');
  return place ? placeInSentence(place) : 'the training ground';
}

function meetingKey(meeting: Meeting): keyof SenseiSpeech['meetingNames'] {
  return meeting.kind === 'lesson' ? 'lesson' : meeting.format;
}

function notice(state: GameState, entry: NewEntry): GameState {
  const notices = [...(state.mentor.notices ?? []), entry];
  return { ...state, mentor: { ...state.mentor, notices } };
}

/** A missed meeting's outcome and cost; the meeting itself if it was missed. */
function settleMeeting(state: GameState, ctx: GameContext, sensei: PersonDef, day: number) {
  const meeting = meetingOn(state, sensei, day);
  if (!meeting) return { state, missed: null };
  const outcome: MeetingOutcome = outcomeOf(state, ctx, sensei, meeting);
  const grip = waysOf(sensei)?.grip ?? 'firm';
  const delta =
    outcome === 'missed'
      ? -MISSED_REGARD[grip]
      : outcome === 'kept' && meeting.kind === 'lesson'
        ? LESSON_KEPT_REGARD
        : 0;
  const recorded = { ...state.mentor, outcomes: { ...state.mentor.outcomes, [day]: outcome } };
  const mentor: Mentor = delta > 0 ? withAttendance(recorded, delta) : withRegard(recorded, delta);
  return { state: { ...state, mentor }, missed: outcome === 'missed' ? meeting : null };
}

/** A team day: kept if you came, excused or missed as a meeting is. Its name, if missed. */
function settleTeamDay(state: GameState, ctx: GameContext, sensei: PersonDef, day: number) {
  const teamDay = teamDayOf(state, sensei, weekOf(day));
  const key = teamKey(day);
  if (teamDay?.day !== day || state.mentor.outcomes[key] === 'kept') return { state, missed: null };
  const outcome: MeetingOutcome = excused(state, ctx) ? 'excused' : 'missed';
  const grip = waysOf(sensei)?.grip ?? 'firm';
  const delta = outcome === 'missed' ? -MISSED_REGARD[grip] : 0;
  const mentor = withRegard(
    { ...state.mentor, outcomes: { ...state.mentor.outcomes, [key]: outcome } },
    delta,
  );
  const ritual = ctx.content.senseiSpeech.ritualNames[teamDay.ritual.kind];
  return { state: { ...state, mentor }, missed: outcome === 'missed' ? ritual : null };
}

interface Missed {
  readonly meeting: Meeting | null;
  readonly ritual: string | null;
}

/** One note for a day's missed meeting and team day: what they made of it, once. */
/** The banks a day's missed note is drawn from: the meeting by grip, then the team day. */
function missedBanks(speech: SenseiSpeech, grip: SenseiGrip, missed: Missed) {
  const team = missed.meeting
    ? { name: 'sensei-team-also', lines: speech.teamAlso }
    : { name: 'sensei-team-missed', lines: speech.teamMissed };
  return [
    ...(missed.meeting ? [{ name: `sensei-missed-${grip}`, lines: speech.missed[grip] }] : []),
    ...(missed.ritual ? [team] : []),
  ];
}

function missedNotice(state: GameState, ctx: GameContext, sensei: PersonDef, missed: Missed) {
  const speech = ctx.content.senseiSpeech;
  const key = `${state.board.seed}|${state.time.day}`;
  const banks = missedBanks(speech, waysOf(sensei)?.grip ?? 'firm', missed);
  let told = state.told;
  const lines = banks.map((bank) => {
    const picked = tellFresh(told, bank, key);
    told = picked.told;
    return picked.line;
  });
  const slots = {
    ...personSlots('name', sensei),
    place: meetingPlace(ctx),
    what: missed.meeting ? speech.meetingNames[meetingKey(missed.meeting)] : '',
    ritual: missed.ritual ?? '',
  };
  return notice(
    { ...state, told },
    {
      text: fillSlots(lines.join(' '), slots),
      tone: 'warning',
      chips: [{ label: `${sensei.name}’s regard falls`, tone: 'cost' }],
    },
  );
}

function settleDay(state: GameState, ctx: GameContext, sensei: PersonDef, day: number) {
  const met = settleMeeting(state, ctx, sensei, day);
  const team = settleTeamDay(met.state, ctx, sensei, day);
  if (!met.missed && !team.missed) return team.state;
  return missedNotice(team.state, ctx, sensei, { meeting: met.missed, ritual: team.missed });
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
  const speech = ctx.content.senseiSpeech;
  const told = tellFresh(
    state.told,
    { name: 'sensei-expects', lines: speech.expects },
    `${state.board.seed}|${state.time.day}`,
  );
  const text = fillSlots(told.line, {
    ...personSlots('name', sensei),
    place: meetingPlace(ctx),
    when: WHEN[meeting.from],
    for: speech.meetingFor[meetingKey(meeting)],
  });
  return notice({ ...state, told: told.told }, { text, tone: 'info' });
}

/** Called as each new day begins (`spendTime`). */
export function settleMentor(state: GameState, ctx: GameContext): GameState {
  const today = state.time.day;
  const sensei = mentorOf(state, ctx);
  if (!sensei) return { ...state, mentor: { ...state.mentor, settledDay: today - 1 } };
  let settled = state;
  for (let day = state.mentor.settledDay + 1; day < today; day += 1) {
    settled = settleDay(settled, ctx, sensei, day);
  }
  const mentor = thisWeek({ ...settled.mentor, settledDay: today - 1 }, today);
  const next = { ...settled, mentor };
  return slotName(state.time) === 'morning' ? expectedToday(next, ctx, sensei) : next;
}

/** What the morning brought, written after the action that brought it. */
export function flushMentorNotices(state: GameState): GameState {
  const { notices, ...mentor } = state.mentor;
  if (!notices) return state;
  const journal = notices.reduce((j, entry) => write(j, state.time, entry), state.journal);
  return { ...state, mentor, journal };
}
