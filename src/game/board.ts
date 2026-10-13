import { hashUnit } from '@/core';
import { crewOptions, postingShare, type Crew, type MissionDef } from '@/systems/missions';
import type { Standing } from '@/systems/standing';

import type { GameContext } from './context';
import type { Board, Posting } from './boardState';
import { assigneeOf, crewOn, jobOf } from './crew';
import type { GameState } from './state';

/**
 * The jobs board. Standing jobs (patrols, watches) are always there, once a day. Everything
 * else is posted for a few days and then gone, and only jobs you are trusted with are posted
 * at all: your record must reach a job's mark, and the village must be willing to send someone
 * of your rank on it, with some crew (`systems/missions/crew.ts`). Each posting's crew is
 * decided by the day it went up (`crew.ts`).
 * Exam-only missions are never posted. Which jobs go up is a hash of the save's seed and the day: varied per save,
 * reproducible, and computable at any time without consuming the game's dice.
 */

const DAILY_POST_CHANCE = 0.35;
const MIN_POSTINGS = 2;
const MAX_POSTINGS = 5;
const MIN_DAYS_UP = 2;
const MAX_DAYS_UP = 4;
/** After a long absence, only the last few weeks of postings matter. */
const MAX_CATCH_UP_DAYS = 28;

/** Who the board is for: your record, and what the village remembers of your jobs. */
interface Reader {
  readonly standing: Standing;
  readonly marks: readonly string[];
}

function readerOf(state: GameState): Reader {
  return { standing: state.standing, marks: state.village.marks };
}

function trusted(def: MissionDef, who: Reader, ctx: GameContext): boolean {
  const { standing } = who;
  return (
    def.examOnly !== true &&
    def.minMissionsCompleted <= standing.missionsCompleted &&
    (def.needsWorldMark === undefined || who.marks.includes(def.needsWorldMark)) &&
    crewOptions(jobOf(ctx, def), assigneeOf(standing)).length > 0
  );
}

/** The chance a job goes up on a given day: jōnin are seldom offered chores. */
function postChance(def: MissionDef, who: Reader, ctx: GameContext): number {
  return DAILY_POST_CHANCE * postingShare(jobOf(ctx, def), assigneeOf(who.standing));
}

function postingFor(board: Board, def: MissionDef, day: number): Posting {
  const span = MAX_DAYS_UP - MIN_DAYS_UP + 1;
  const daysUp = MIN_DAYS_UP + Math.floor(hashUnit(board.seed, day, def.id, 'length') * span);
  return { missionId: def.id, postedDay: day, expiresDay: day + daysUp - 1 };
}

/** Missions in the order of a key worked out once each (a hash is too dear for a comparator). */
function byHash(missions: readonly MissionDef[], key: (m: MissionDef) => number): MissionDef[] {
  return missions
    .map((m) => ({ m, k: key(m) }))
    .sort((a, b) => a.k - b.k)
    .map(({ m }) => m);
}

/** Postings for one new day: expired ones come down, new ones go up. */
function postDay(board: Board, day: number, ctx: GameContext, who: Reader): Board {
  const kept = board.postings.filter((p) => p.expiresDay >= day);
  const candidates = ctx.content.missions.all.filter(
    (m) => !m.standing && trusted(m, who, ctx) && !kept.some((p) => p.missionId === m.id),
  );
  // Shuffled by the hash, so the cap on postings favours no job for where it sits in the pack.
  const fresh = byHash(
    candidates.filter((m) => hashUnit(board.seed, day, m.id) < postChance(m, who, ctx)),
    (m) => hashUnit(board.seed, day, m.id, 'order'),
  );
  const fillers = byHash(
    candidates.filter((m) => !fresh.includes(m)),
    (m) => hashUnit(board.seed, day, m.id, 'fill'),
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
  const seen = caughtUp.get(state.board);
  if (
    seen?.day === today &&
    seen.standing === state.standing &&
    seen.marks === state.village.marks &&
    seen.missions === missions
  ) {
    return seen.board;
  }
  const from = Math.max(state.board.refreshedDay + 1, today - MAX_CATCH_UP_DAYS);
  let board = state.board;
  const who = readerOf(state);
  for (let day = from; day <= today; day++) board = postDay(board, day, ctx, who);
  caughtUp.set(state.board, { day: today, ...who, missions, board });
  return board;
}

/**
 * The last catch-up worked out from each stored board. A view asks for the board once per job
 * on it, and with a hundred jobs catching up afresh each time is far too slow; boards are
 * immutable, so the answer for the same board, day, record and jobs never changes.
 */
const caughtUp = new WeakMap<
  Board,
  {
    readonly day: number;
    readonly standing: Standing;
    readonly marks: readonly string[];
    readonly missions: readonly MissionDef[];
    readonly board: Board;
  }
>();

export type Availability =
  | { readonly kind: 'standing'; readonly doneToday: boolean }
  | { readonly kind: 'posted'; readonly daysLeft: number; readonly isNew: boolean }
  | { readonly kind: 'absent' };

/** The day a job's posting went up (today for a standing job), or null when it isn't up. */
function postedDay(state: GameState, ctx: GameContext, def: MissionDef): number | null {
  if (def.standing) return state.time.day;
  return boardFor(state, ctx).postings.find((p) => p.missionId === def.id)?.postedDay ?? null;
}

/** Who goes with you on a job on the board today; null when it isn't yours to take. */
export function crewFor(state: GameState, ctx: GameContext, def: MissionDef): Crew | null {
  if (!trusted(def, readerOf(state), ctx)) return null;
  const day = postedDay(state, ctx, def);
  return day === null ? null : crewOn(state, ctx, def, day);
}

/** Whether a job is on the board today, and how. */
export function availability(state: GameState, ctx: GameContext, def: MissionDef): Availability {
  if (!crewFor(state, ctx, def)) return { kind: 'absent' };
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

/** Jobs that will go up tomorrow (if nothing changes before then), for the village gossip. */
export function newPostingsTomorrow(state: GameState, ctx: GameContext): string[] {
  const tomorrow = state.time.day + 1;
  const next = postDay(boardFor(state, ctx), tomorrow, ctx, readerOf(state));
  return next.postings.filter((p) => p.postedDay === tomorrow).map((p) => p.missionId);
}
