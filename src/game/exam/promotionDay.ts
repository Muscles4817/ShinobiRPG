import { capitalise, counted, numberWord } from '@/core';
import type { PlaceDef } from '@/content';
import { daysAway, type MissionDef } from '@/systems/missions';

import type { GameContext } from '../context';
import { atHomeVillage, homeVillageId } from '../homeVillage';
import { jobAsWalked } from '../jobRoads';
import { busyReason, log, placeHere } from '../ops';
import type { GameState } from '../state';
import type { Ceremony, PromotionDay, PromotionRoute } from './state';

/**
 * When and where a promotion is held. Some happen where you stand: the exam's verdict, a field
 * promotion at the end of the job that earned it, an arc's patron raising you as it closes. The
 * village's own (a jōnin's nomination, your sensei's recommendation) are held at home on a day
 * set `PROMOTION_NOTICE_DAYS` ahead. No job that would keep you away over it is signed out. If
 * the day comes while you are away anyway (you left on your own account), the ceremony goes
 * ahead without you and the rank waits for you to report to the mission hall when you are back.
 */

/** How far ahead the village sets the day. */
export const PROMOTION_NOTICE_DAYS = 3;

/** Routes the village holds at home on a day of its own; the rest are held on the spot. */
const HELD_AT_HOME: Readonly<Record<PromotionRoute, boolean>> = {
  exam: false,
  field: false,
  arc: false,
  nomination: true,
  sensei: true,
};

/** The mission hall of your home village, where a missed promotion is collected. */
export function homeHall(
  state: GameState,
  ctx: GameContext,
): Extract<PlaceDef, { kind: 'missions' }> | undefined {
  const village = ctx.content.locations.get(homeVillageId(state, ctx));
  return village?.places.find(
    (p): p is Extract<PlaceDef, { kind: 'missions' }> => p.kind === 'missions',
  );
}

function hallName(state: GameState, ctx: GameContext): string {
  return homeHall(state, ctx)?.name ?? 'the mission hall';
}

/** A promotion earned: held now, or set for a day at home and announced. */
export function awardPromotion(state: GameState, ctx: GameContext, ceremony: Ceremony): GameState {
  if (!HELD_AT_HOME[ceremony.route]) return { ...state, exams: { ...state.exams, ceremony } };
  const day = state.time.day + PROMOTION_NOTICE_DAYS;
  const promotionDay: PromotionDay = { ceremony, day, missed: false };
  return log(
    { ...state, exams: { ...state.exams, promotionDay } },
    {
      heading: 'A day is set',
      text: `Word comes from ${hallName(state, ctx)}: you are to be raised ${numberWord(PROMOTION_NOTICE_DAYS)} days from now. Be at home for it.`,
      tone: 'success',
    },
  );
}

/** Whether a promotion is earned and not yet held: on its way, or waiting for you. */
export function promotionPending(state: GameState): boolean {
  return state.exams.ceremony !== null || state.exams.promotionDay !== null;
}

function heldNow(state: GameState, ceremony: Ceremony): GameState {
  return { ...state, exams: { ...state.exams, ceremony, promotionDay: null } };
}

/** Whether the village's day for your promotion has come and it is still to be held. */
function dueNow(state: GameState): PromotionDay | null {
  const due = state.exams.promotionDay;
  return due && !due.missed && state.time.day >= due.day ? due : null;
}

/** On the day, home and free: the ceremony is held (a happening that needs both). */
export function promotionHeld(state: GameState): GameState {
  const due = dueNow(state);
  return due ? heldNow(state, due.ceremony) : state;
}

/** On the day and away: it goes ahead without you, told once, and the rank waits at the hall. */
export function promotionMissed(state: GameState, ctx: GameContext): GameState {
  const due = dueNow(state);
  if (!due) return state;
  return log(
    { ...state, exams: { ...state.exams, promotionDay: { ...due, missed: true } } },
    {
      heading: 'Raised in your absence',
      text: `The ceremony went ahead without you. Report to ${hallName(state, ctx)} when you are home to take up the rank.`,
      tone: 'info',
    },
  );
}

/** Why you can't collect a missed promotion here and now, if you can't. */
export function collectBlocker(state: GameState, ctx: GameContext): string | null {
  const due = state.exams.promotionDay;
  if (!due?.missed) return 'There is nothing waiting for you here.';
  const hall = homeHall(state, ctx);
  const here = placeHere(state, ctx, 'missions');
  if (!atHomeVillage(state, ctx) || !hall || here?.id !== hall.id) {
    return `It waits for you at ${hallName(state, ctx)}.`;
  }
  return busyReason(state);
}

/** Collecting a missed promotion: its ceremony is held now. */
export function collectPromotion(state: GameState): GameState {
  const due = state.exams.promotionDay;
  return due ? heldNow(state, due.ceremony) : state;
}

/** Days until the village holds your promotion, or null when none is set (or it was missed). */
export function daysToPromotion(state: GameState): number | null {
  const due = state.exams.promotionDay;
  return due && !due.missed ? Math.max(0, due.day - state.time.day) : null;
}

/** "Today", "Tomorrow", "In 3 days": when the village holds it. */
export function promotionWhen(days: number): string {
  if (days === 0) return 'today';
  return days === 1 ? 'tomorrow' : `in ${counted(days, 'day')}`;
}

/** The refusal to sign you out for a job that would keep you away over your promotion. */
export function promotionClash(state: GameState, ctx: GameContext, def: MissionDef): string | null {
  const days = daysToPromotion(state);
  if (days === null) return null;
  const away = daysAway(jobAsWalked(state, ctx, def));
  if (away === 0 || away <= days) return null;
  return capitalise(
    `you are being raised ${promotionWhen(days)}. The hall won’t send you away over it.`,
  );
}
