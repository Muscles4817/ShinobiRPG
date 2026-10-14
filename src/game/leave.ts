import { stageOf } from '@/systems/bonds';
import { arcBases, dangerAtLeast } from '@/systems/missions';
import { RANKS, type Rank } from '@/systems/standing';
import { DAYS_PER_SEASON, formatDate } from '@/systems/time';
import { leaveLeft, passValid, signPass, takeLeave, type Journey } from '@/systems/travel';

import type { PersonDef } from '@/content';
import type { GameContext } from './context';
import { log } from './ops';
import { bondOf } from './people/cast';
import { homeVillageId } from './homeVillage';
import type { GameState } from './state';

/**
 * Who may leave the village on a trip of their own (decision 4 of the world plan; jobs need no
 * leave, their road is orders). A genin goes only on their sensei's pass, signed at the weekly
 * lesson once the sensei knows them, and only by safe roads; a chūnin spends days of leave,
 * a season's allowance; a jōnin comes and goes. Going home never needs leave, nor going to
 * the town a long story's current act is based in.
 */

/** Days a pass is good for: until the next week's lesson. */
export const PASS_DAYS = 7;
/** Bond stage with your sensei before they sign one (1: they know you). */
export const PASS_BOND_STAGE = 1;
/** A chūnin's days of leave each season, counted by the day on the road out. */
export const CHUNIN_LEAVE_DAYS = 10;
/** From this rank you come and go as you please. */
const FREE_RANK: Rank = 'jonin';

export const PASS_NEEDED =
  'Genin leave the village only on a job, or with a pass your sensei signs at your weekly lesson.';
export const SAFE_ROADS_ONLY = 'Your sensei’s pass covers safe roads only.';

function rankAtLeast(state: GameState, rank: Rank): boolean {
  return RANKS.indexOf(state.standing.rank) >= RANKS.indexOf(rank);
}

/** Seasons since the game began: what a chūnin's leave is counted by. */
function seasonNumber(day: number): number {
  return Math.floor((day - 1) / DAYS_PER_SEASON);
}

function leaveDaysLeft(state: GameState): number {
  return leaveLeft(state.leave, seasonNumber(state.time.day), CHUNIN_LEAVE_DAYS);
}

/** Why you can't set out on this trip, or null. */
export function leaveBlocker(
  state: GameState,
  ctx: GameContext,
  destinationId: string,
  journey: Journey,
): string | null {
  if (destinationId === homeVillageId(state, ctx) || rankAtLeast(state, FREE_RANK)) return null;
  if (onOrders(state, ctx, destinationId)) return null;
  if (rankAtLeast(state, 'chunin')) {
    const left = leaveDaysLeft(state);
    return journey.days > left
      ? `You have ${left === 0 ? 'no' : left} ${left === 1 ? 'day' : 'days'} of leave left this season.`
      : null;
  }
  if (!passValid(state.leave, state.time.day)) return PASS_NEEDED;
  return dangerAtLeast(journey.danger, 'armed') ? SAFE_ROADS_ONLY : null;
}

/** A town where a long story's current act is based: going there is orders, not leave. */
function onOrders(state: GameState, ctx: GameContext, destinationId: string): boolean {
  return arcBases(ctx.content.arcs.all, state.board.completed).includes(destinationId);
}

/** Setting out: a chūnin's leave is spent by the days on the road. */
export function spendLeave(
  state: GameState,
  ctx: GameContext,
  destinationId: string,
  journey: Journey,
): GameState {
  const counted =
    destinationId !== homeVillageId(state, ctx) &&
    !onOrders(state, ctx, destinationId) &&
    rankAtLeast(state, 'chunin') &&
    !rankAtLeast(state, FREE_RANK);
  if (!counted) return state;
  return { ...state, leave: takeLeave(state.leave, seasonNumber(state.time.day), journey.days) };
}

/** Where you stand for leave, as a line for the Travel tab, or null when you come and go. */
export function leaveLine(state: GameState): string | null {
  if (rankAtLeast(state, FREE_RANK)) return null;
  if (rankAtLeast(state, 'chunin')) {
    const left = leaveDaysLeft(state);
    return `${left === 0 ? 'No' : left} ${left === 1 ? 'day' : 'days'} of leave left this season.`;
  }
  const until = state.leave.passUntil;
  return until !== null && passValid(state.leave, state.time.day)
    ? `Your sensei’s pass is good until ${formatDate({ day: until, slot: 0 })}, for safe roads.`
    : PASS_NEEDED;
}

/** After the weekly lesson: a genin your sensei knows gets a pass for the week. */
export function passAfterLesson(state: GameState, sensei: PersonDef): GameState {
  if (rankAtLeast(state, 'chunin')) return state;
  if (stageOf(bondOf(state, sensei.id).points) < PASS_BOND_STAGE) return state;
  const renewed = passValid(state.leave, state.time.day);
  const signed = { ...state, leave: signPass(state.leave, state.time.day, PASS_DAYS) };
  if (renewed) return signed;
  return log(signed, {
    heading: 'A travel pass',
    text: `${sensei.name} signs a pass. "Safe roads, back by the next lesson. Don’t make me come and find you."`,
    tone: 'success',
    chips: [{ label: `Pass for ${PASS_DAYS} days`, tone: 'gain' }],
  });
}
