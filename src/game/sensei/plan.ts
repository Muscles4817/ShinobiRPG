import type { PersonDef, RitualKind, SenseiRitual, SessionFormat } from '@/content';
import { hashUnit } from '@/core';
import { stageOf } from '@/systems/bonds';
import { DAYS_PER_WEEK, TIME_SLOTS, weekOf, type TimeSlot } from '@/systems/time';

import type { GameContext } from '../context';
import { findPerson, bondOf } from '../people/cast';
import { underSensei } from '../mentorship';
import type { GameState } from '../state';
import { waysOf } from './generate';

/**
 * The week your sensei plans for you: their cadence of meetings, spread over the week (or on
 * days of their choosing, for an irregular one), the first the full lesson and the rest short
 * sessions in their formats. It is drawn from the seed and the week, never the Rng, so the
 * plan on the slip and the plan the game keeps agree. Once your bond reaches the stage where
 * they ease off, they plan half as much.
 */

/** The last slot your sensei will meet you in: they train you by day. */
const LAST_MEETING_SLOT: TimeSlot = 'evening';

export type Meeting =
  | { readonly kind: 'lesson'; readonly day: number; readonly from: TimeSlot }
  | {
      readonly kind: 'session';
      readonly day: number;
      readonly from: TimeSlot;
      readonly format: SessionFormat;
    };

/** Your sensei, while you are in your genin years with one. */
export function mentorOf(state: GameState, ctx: GameContext): PersonDef | null {
  if (!underSensei(state)) return null;
  const id = state.people.team?.senseiId;
  return id ? (findPerson(state, ctx, id) ?? null) : null;
}

/** The first day of a week. */
export function weekStart(week: number): number {
  return week * DAYS_PER_WEEK + 1;
}

/** Meetings a week, eased once you are close enough. */
export function meetingsPerWeek(state: GameState, sensei: PersonDef): number {
  const ways = waysOf(sensei);
  if (!ways) return 0;
  const eased = stageOf(bondOf(state, sensei.id).points) >= ways.loosensAtStage;
  return eased ? Math.ceil(ways.cadence.sessions / 2) : ways.cadence.sessions;
}

/** The days of the week (0–6) they meet you on. */
function offsets(state: GameState, sensei: PersonDef, week: number, count: number): number[] {
  if (waysOf(sensei)?.cadence.punctuality !== 'irregular') {
    return Array.from({ length: count }, (_, i) => Math.floor((i * DAYS_PER_WEEK) / count));
  }
  return Array.from({ length: DAYS_PER_WEEK }, (_, offset) => offset)
    .map((offset) => ({ offset, k: hashUnit(state.board.seed, week, sensei.id, 'meet', offset) }))
    .sort((a, b) => a.k - b.k)
    .slice(0, count)
    .map(({ offset }) => offset)
    .sort((a, b) => a - b);
}

/** The slot they turn up in: a late sensei comes a slot after they said, never after dark. */
function arrival(sensei: PersonDef): TimeSlot {
  const cadence = waysOf(sensei)?.cadence;
  if (!cadence) return LAST_MEETING_SLOT;
  const said = TIME_SLOTS.indexOf(cadence.slot);
  const last = TIME_SLOTS.indexOf(LAST_MEETING_SLOT);
  const index = Math.min(last, cadence.punctuality === 'late' ? said + 1 : said);
  return TIME_SLOTS[index] ?? LAST_MEETING_SLOT;
}

/** The meetings your sensei plans for a week, in day order. */
export function weekPlan(state: GameState, sensei: PersonDef, week: number): Meeting[] {
  const ways = waysOf(sensei);
  if (!ways) return [];
  const from = arrival(sensei);
  const days = offsets(state, sensei, week, meetingsPerWeek(state, sensei));
  return days.map((offset, i): Meeting => {
    const day = weekStart(week) + offset;
    if (i === 0) return { kind: 'lesson', day, from };
    const format = ways.formats[(i - 1) % ways.formats.length] ?? 'drill';
    return { kind: 'session', day, from, format };
  });
}

/** The meeting planned for a day, if any. */
export function meetingOn(state: GameState, sensei: PersonDef, day: number): Meeting | null {
  return weekPlan(state, sensei, weekOf(day)).find((m) => m.day === day) ?? null;
}

/** Whether a meeting is on right now: its day, from the slot they come until the day's end. */
export function meetingOpen(state: GameState, meeting: Meeting): boolean {
  const slot = state.time.slot;
  return (
    meeting.day === state.time.day &&
    slot >= TIME_SLOTS.indexOf(meeting.from) &&
    slot <= TIME_SLOTS.indexOf(LAST_MEETING_SLOT)
  );
}

/** A team day: one of their rituals, once a week, on a day of their choosing. */
export interface TeamDay {
  readonly day: number;
  readonly ritual: SenseiRitual;
  readonly from: TimeSlot;
}

/** When each kind of team day starts: work by day, eating and talking in the evening. */
const RITUAL_FROM: Readonly<Record<RitualKind, TimeSlot>> = {
  meal: 'evening',
  challenge: 'afternoon',
  tea: 'evening',
  debrief: 'afternoon',
  camp: 'afternoon',
};

/** The week's team day, if your sensei keeps any: their rituals in turn, week by week. */
export function teamDayOf(state: GameState, sensei: PersonDef, week: number): TeamDay | null {
  const rituals = waysOf(sensei)?.rituals ?? [];
  const ritual = rituals[week % Math.max(1, rituals.length)];
  if (!ritual) return null;
  const offset = Math.floor(hashUnit(state.board.seed, week, sensei.id, 'team') * DAYS_PER_WEEK);
  return { day: weekStart(week) + offset, ritual, from: RITUAL_FROM[ritual.kind] };
}

/** The key a team day's outcome is kept under, apart from a meeting on the same day. */
export function teamKey(day: number): string {
  return `t${day}`;
}

/** Whether a team day is on now: its day, from its slot until the day's end. */
export function teamDayOpen(state: GameState, teamDay: TeamDay): boolean {
  const slot = state.time.slot;
  return (
    teamDay.day === state.time.day &&
    slot >= TIME_SLOTS.indexOf(teamDay.from) &&
    slot <= TIME_SLOTS.indexOf(LAST_MEETING_SLOT)
  );
}
