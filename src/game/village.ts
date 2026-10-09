import { hashUnit } from '@/core';
import type { FestivalDef, OpeningHours, RumourDef, SightDef } from '@/content';
import { calendarDay, daysUntil, slotName, TIME_SLOTS } from '@/systems/time';

import { newPostingsTomorrow } from './board';
import type { GameContext } from './context';
import type { GameState } from './state';

/**
 * Village life, derived from the calendar and the save's seed: what is open at this hour,
 * whether today is a festival, what people are gossiping about, and what drifts through the
 * streets tonight. Like the jobs board, it is a hash of the day, so it never uses the dice.
 */

const RUMOURS_PER_DAY = 3;
/** Job rumours go round the day before the job is posted, but never crowd out all the gossip. */
const MAX_JOB_RUMOURS = 2;
/** A festival is announced on the village screen this many days ahead. */
const FESTIVAL_NOTICE_DAYS = 7;
const NIGHT = TIME_SLOTS.indexOf('night');

export function isOpen(hours: OpeningHours | undefined, state: Pick<GameState, 'time'>): boolean {
  return hours === undefined || hours.includes(slotName(state.time));
}

/** "Opens this evening." for a place or stall that is shut right now, else null. */
export function opening(
  hours: OpeningHours | undefined,
  state: Pick<GameState, 'time'>,
): string | null {
  if (!hours || isOpen(hours, state)) return null;
  const later = TIME_SLOTS.slice(state.time.slot + 1).find((slot) => hours.includes(slot));
  return `Opens ${later ? `this ${later}` : `in the ${hours[0] ?? 'morning'}`}.`;
}

/** "Closed. Opens in the morning." for a sign on the door, else null. */
export function closedSign(
  hours: OpeningHours | undefined,
  state: Pick<GameState, 'time'>,
): string | null {
  const opens = opening(hours, state);
  return opens && `Closed. ${opens}`;
}

/** "The forge is closed. Opens in the morning." for a blocker, else null. */
export function closedReason(
  name: string,
  hours: OpeningHours | undefined,
  state: Pick<GameState, 'time'>,
): string | null {
  const opens = opening(hours, state);
  return opens && `${name} is closed. ${opens}`;
}

export function festivalToday(state: GameState, ctx: GameContext): FestivalDef | null {
  const today = calendarDay(state.time.day);
  return (
    ctx.content.village.festivals.find((f) => f.season === today.season && f.day === today.day) ??
    null
  );
}

export interface FestivalNotice {
  readonly festival: FestivalDef;
  /** 0 = today. */
  readonly daysAway: number;
}

/** Today's festival, or the next one if it is close enough to announce. */
export function festivalNotice(state: GameState, ctx: GameContext): FestivalNotice | null {
  const next = ctx.content.village.festivals
    .map((festival) => ({ festival, daysAway: daysUntil(state.time.day, festival) }))
    .sort((a, b) => a.daysAway - b.daysAway)[0];
  return next && next.daysAway <= FESTIVAL_NOTICE_DAYS ? next : null;
}

/** What something on the market costs today: festivals bring prices down. */
export function marketPrice(cost: number, state: GameState, ctx: GameContext): number {
  const factor = festivalToday(state, ctx)?.marketPrices ?? 1;
  return Math.max(1, Math.round(cost * factor));
}

/** Extra bond points every conversation earns today. */
export function festivalBondBonus(state: GameState, ctx: GameContext): number {
  return festivalToday(state, ctx)?.bondBonus ?? 0;
}

function byHash(state: GameState, salt: string) {
  return (a: { id: string }, b: { id: string }) =>
    hashUnit(state.board.seed, state.time.day, a.id, salt) -
    hashUnit(state.board.seed, state.time.day, b.id, salt);
}

/** Today's gossip: hints at tomorrow's new jobs first, then talk about people and the village. */
export function rumoursToday(state: GameState, ctx: GameContext): RumourDef[] {
  const { rumours } = ctx.content.village;
  const tomorrow = new Set(newPostingsTomorrow(state, ctx));
  const jobs = rumours
    .filter((r) => r.missionId !== undefined && tomorrow.has(r.missionId))
    .sort(byHash(state, 'rumour'))
    .slice(0, MAX_JOB_RUMOURS);
  const talk = rumours
    .filter((r) => r.missionId === undefined)
    .sort(byHash(state, 'rumour'))
    .slice(0, RUMOURS_PER_DAY - jobs.length);
  return [...jobs, ...talk];
}

/** Eyes like an awakened bloodline's see what walks the village at night. */
export function hasSight(state: GameState, ctx: GameContext): boolean {
  const bloodline = ctx.content.clans.get(state.character.clanId)?.kekkeiGenkai;
  return bloodline !== undefined && !bloodline.dormant;
}

export function isNight(state: Pick<GameState, 'time'>): boolean {
  return state.time.slot === NIGHT;
}

/** What drifts through the village tonight, if it is night and the pack has any. */
export function sightTonight(state: GameState, ctx: GameContext): SightDef | null {
  if (!isNight(state)) return null;
  return [...ctx.content.village.sights].sort(byHash(state, 'sight'))[0] ?? null;
}
