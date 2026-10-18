import { hashUnit, listed } from '@/core';
import type { FestivalDef, OpeningHours, RumourDef, SightDef, Stall } from '@/content';
import {
  calendarDay,
  daysUntil,
  type Season,
  seasonOf,
  slotName,
  TIME_SLOTS,
} from '@/systems/time';

import { visitingOn } from './merchants';
import { newPostingsTomorrow } from './board';
import type { GameContext } from './context';
import { examRumours } from './exam/calendar';
import { ringOrder, stillOpen, stretchOf } from './gossip';
import { placeHere, placesHere } from './ops';
import { atHomeVillage } from './homeVillage';
import type { GameState } from './state';

/**
 * Village life, derived from the calendar and the save's seed: what is open at this hour,
 * what is in season, whether today is a festival, what people are gossiping about, and what drifts through the
 * streets tonight. Like the jobs board, it is a hash of the day, so it never uses the dice.
 */

const RUMOURS_PER_DAY = 3;
/** The izakaya hears more than the street does. */
const OVERHEARD_PER_NIGHT = 5;
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

/** The festivals held where you are: the village's own, or a town's. */
function festivalsHere(state: GameState, ctx: GameContext): readonly FestivalDef[] {
  return ctx.content.village.festivals.filter(
    (f) => (f.locationId ?? ctx.content.startLocationId) === state.locationId,
  );
}

export function festivalToday(state: GameState, ctx: GameContext): FestivalDef | null {
  const today = calendarDay(state.time.day);
  return (
    festivalsHere(state, ctx).find((f) => f.season === today.season && f.day === today.day) ?? null
  );
}

export interface FestivalNotice {
  readonly festival: FestivalDef;
  /** 0 = today. */
  readonly daysAway: number;
}

/** Today's festival, or the next one if it is close enough to announce. */
export function festivalNotice(state: GameState, ctx: GameContext): FestivalNotice | null {
  const next = festivalsHere(state, ctx)
    .map((festival) => ({ festival, daysAway: daysUntil(state.time.day, festival) }))
    .sort((a, b) => a.daysAway - b.daysAway)[0];
  return next && next.daysAway <= FESTIVAL_NOTICE_DAYS ? next : null;
}

/** What something on the market costs today: festivals bring prices down. */
export function marketPrice(cost: number, state: GameState, ctx: GameContext): number {
  const factor = festivalToday(state, ctx)?.marketPrices ?? 1;
  return Math.max(1, Math.round(cost * factor));
}

/** Whether a dish or ingredient sold only in some seasons is on sale today. */
export function inSeason(
  goods: { readonly seasons?: readonly Season[] },
  state: Pick<GameState, 'time'>,
): boolean {
  return goods.seasons === undefined || goods.seasons.includes(seasonOf(state.time.day));
}

/** "Autumn only" for a dish or ingredient sold only in some seasons, else null. */
export function seasonNote(goods: { readonly seasons?: readonly Season[] }): string | null {
  return goods.seasons ? `${listed(goods.seasons)} only` : null;
}

/** The dishes on a menu that are in season today. */
export function menuToday(
  foodIds: readonly string[],
  state: GameState,
  ctx: GameContext,
): string[] {
  return foodIds.filter((id) => inSeason(ctx.content.foods.require(id), state));
}

/** A stall as it is today: out-of-season dishes and ingredients come off the counter. */
function inSeasonStall<S extends Stall>(stall: S, state: GameState, ctx: GameContext): S {
  const { ingredientIds } = stall;
  return {
    ...stall,
    foodIds: menuToday(stall.foodIds, state, ctx),
    ...(ingredientIds && {
      ingredientIds: ingredientIds.filter((id) =>
        inSeason(ctx.content.ingredients.require(id), state),
      ),
    }),
  };
}

/** A stall in the market here; festival stalls only set up on their day. */
export interface MarketStall extends Stall {
  readonly festival: boolean;
}

/**
 * The market's stalls here, with today's festival stalls set up in front; travelling merchants
 * only on their days (`merchants.ts`).
 */
export function stallsHere(state: GameState, ctx: GameContext): MarketStall[] {
  const market = placeHere(state, ctx, 'market');
  if (!market) return [];
  const festive = festivalToday(state, ctx)?.stalls ?? [];
  return [
    ...festive.map((stall) => ({ ...inSeasonStall(stall, state, ctx), festival: true })),
    ...market.stalls
      .filter((stall) => visitingOn(stall, state.time.day))
      .map((stall) => ({ ...inSeasonStall(stall, state, ctx), festival: false })),
  ];
}

/** Everywhere here that sells food: market stalls (festival ones too) and izakaya menus. */
export function foodSellersHere(state: GameState, ctx: GameContext): Stall[] {
  const taverns = placesHere(state, ctx, 'tavern').map((t): Stall => ({
    name: t.name,
    blurb: t.blurb,
    icon: t.icon,
    foodIds: menuToday(t.foodIds, state, ctx),
    ...(t.hours ? { hours: t.hours } : {}),
  }));
  return [...stallsHere(state, ctx), ...taverns];
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

interface Earful {
  readonly maxJobs: number;
  readonly total: number;
}

function gossip(state: GameState, ctx: GameContext, { maxJobs, total }: Earful): RumourDef[] {
  const { rumours } = ctx.content.village;
  const { day } = state.time;
  // A coming exam is what everyone talks about, every other day.
  const exam = stretchOf(examRumours(state, ctx), day, 1);
  const tomorrow = new Set(newPostingsTomorrow(state, ctx));
  const jobs = rumours
    .filter((r) => r.missionId !== undefined && tomorrow.has(r.missionId))
    .filter((r) => stillOpen(r, state, ctx))
    .sort(byHash(state, 'rumour'))
    .slice(0, maxJobs);
  const room = Math.max(0, total - jobs.length - exam.length);
  // Talk about what you did is fresher than anything else, once the village remembers it; it
  // takes up to half the day's talk, turn about with the rest.
  const talk = rumours.filter((r) => r.missionId === undefined);
  const told = talk.filter((r) => r.worldMark !== undefined && marked(state, r.worldMark));
  const plain = talk.filter((r) => r.worldMark === undefined);
  const fresh = stretchOf(ringOrder(told, state.board.seed), day, Math.ceil(total / 2));
  const rest = stretchOf(ringOrder(plain, state.board.seed), day, total);
  const said = fresh.slice(0, room);
  return [...exam, ...jobs, ...said, ...rest.slice(0, room - said.length)];
}

const marked = (state: GameState, mark: string) => state.village.marks.includes(mark);

/** Today's gossip: a coming exam, hints at tomorrow's new jobs, then talk about people and the village. */
export function rumoursToday(state: GameState, ctx: GameContext): RumourDef[] {
  // The street talks about the village; away, only a tavern's counter carries it that far.
  if (!atHome(state, ctx)) return [];
  return gossip(state, ctx, { maxJobs: MAX_JOB_RUMOURS, total: RUMOURS_PER_DAY });
}

/** Whether you are in the village itself, where its talk and its night sights are. */
function atHome(state: GameState, ctx: GameContext): boolean {
  return atHomeVillage(state, ctx);
}

/** What you overhear at the izakaya counter: every job tip going round, and more besides. */
export function rumoursOverheard(state: GameState, ctx: GameContext): RumourDef[] {
  return gossip(state, ctx, { maxJobs: Infinity, total: OVERHEARD_PER_NIGHT });
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
  if (!isNight(state) || !atHome(state, ctx)) return null;
  return [...ctx.content.village.sights].sort(byHash(state, 'sight'))[0] ?? null;
}
