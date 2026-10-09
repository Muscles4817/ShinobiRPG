import { hashUnit } from '@/core';
import type { MissionDef } from '@/systems/missions';

import type { GameContext } from './context';
import type { Board, Posting } from './boardState';
import type { GameState } from './state';

/**
 * The jobs board. Standing jobs (patrols, watches) are always there, once a day. Everything
 * else is posted for a few days and then gone, and only jobs you are trusted with are posted
 * at all. Which jobs go up is a hash of the save's seed and the day: varied per save,
 * reproducible, and computable at any time without consuming the game's dice.
 */

const DAILY_POST_CHANCE = 0.35;
const MIN_POSTINGS = 2;
const MAX_POSTINGS = 5;
const MIN_DAYS_UP = 2;
const MAX_DAYS_UP = 4;
/** After a long absence, only the last few weeks of postings matter. */
const MAX_CATCH_UP_DAYS = 28;

function trusted(def: MissionDef, completed: number): boolean {
  return def.minMissionsCompleted <= completed;
}

function postingFor(board: Board, def: MissionDef, day: number): Posting {
  const span = MAX_DAYS_UP - MIN_DAYS_UP + 1;
  const daysUp = MIN_DAYS_UP + Math.floor(hashUnit(board.seed, day, def.id, 'length') * span);
  return { missionId: def.id, postedDay: day, expiresDay: day + daysUp - 1 };
}

/** Postings for one new day: expired ones come down, new ones go up. */
function postDay(
  board: Board,
  day: number,
  missions: readonly MissionDef[],
  completed: number,
): Board {
  const kept = board.postings.filter((p) => p.expiresDay >= day);
  const candidates = missions.filter(
    (m) => !m.standing && trusted(m, completed) && !kept.some((p) => p.missionId === m.id),
  );
  const fresh = candidates.filter((m) => hashUnit(board.seed, day, m.id) < DAILY_POST_CHANCE);
  const fillers = candidates
    .filter((m) => !fresh.includes(m))
    .sort(
      (a, b) => hashUnit(board.seed, day, a.id, 'fill') - hashUnit(board.seed, day, b.id, 'fill'),
    );
  const shortfall = Math.max(0, MIN_POSTINGS - kept.length - fresh.length);
  const added = [...fresh, ...fillers.slice(0, shortfall)].map((m) => postingFor(board, m, day));
  return { ...board, refreshedDay: day, postings: [...kept, ...added].slice(0, MAX_POSTINGS) };
}

/** The board as of today, catching up on any days that passed since it was last updated. */
export function boardFor(state: GameState, ctx: GameContext): Board {
  const today = state.time.day;
  if (state.board.refreshedDay >= today) return state.board;
  const missions = ctx.content.missions.all;
  const completed = state.standing.missionsCompleted;
  const from = Math.max(state.board.refreshedDay + 1, today - MAX_CATCH_UP_DAYS);
  let board = state.board;
  for (let day = from; day <= today; day++) board = postDay(board, day, missions, completed);
  return board;
}

export type Availability =
  | { readonly kind: 'standing'; readonly doneToday: boolean }
  | { readonly kind: 'posted'; readonly daysLeft: number; readonly isNew: boolean }
  | { readonly kind: 'absent' };

/** Whether a job is on the board today, and how. */
export function availability(state: GameState, ctx: GameContext, def: MissionDef): Availability {
  if (!trusted(def, state.standing.missionsCompleted)) return { kind: 'absent' };
  const board = boardFor(state, ctx);
  if (def.standing) {
    return { kind: 'standing', doneToday: board.lastTaken[def.id] === state.time.day };
  }
  const posting = board.postings.find((p) => p.missionId === def.id);
  if (!posting) return { kind: 'absent' };
  return {
    kind: 'posted',
    daysLeft: posting.expiresDay - state.time.day + 1,
    isNew: posting.postedDay === state.time.day,
  };
}

/** Records that a job was taken: postings come down, standing jobs wait until tomorrow. */
export function takeJob(state: GameState, ctx: GameContext, def: MissionDef): Board {
  const board = boardFor(state, ctx);
  if (def.standing) {
    return { ...board, lastTaken: { ...board.lastTaken, [def.id]: state.time.day } };
  }
  return { ...board, postings: board.postings.filter((p) => p.missionId !== def.id) };
}
