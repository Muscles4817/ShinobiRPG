import { hashUnit } from '@/core';
import type { DiceTable, Pastime } from '@/content';

import type { GameContext } from './context';
import { placeHere } from './ops';
import type { DiceCall, DiceThrow, GameState } from './state';

/**
 * Chō-han at the bar's back tables: the cup is shaken, you call the dice even or odd for one
 * of the house's stakes, and the house takes a cut of what you win. Each night's cups come
 * from the save's seed, the day and the round (like the board, never the Rng), so the cup
 * is already settled when you bet, and sharp ears sometimes hear how. That is the edge: a
 * player with poor perception slowly feeds the house, a sharp one makes a little money, and
 * a few rounds a night keep it from being a job.
 */

export const DICE_ROUNDS_PER_NIGHT = 3;
/** The house's share of a win. */
export const HOUSE_CUT = 0.1;
/** Hearing the dice settle: a little for anyone, more with perception, never certain. */
export const HEAR_BASE = 0.05;
export const HEAR_PER_PERCEPTION = 0.022;
export const HEAR_MOST = 0.6;

export const CALL_NAMES: Readonly<Record<DiceCall, string>> = { even: 'Chō', odd: 'Han' };

/** A dice table at the bar you're in, by its pastime id. */
export function diceTableHere(
  state: GameState,
  ctx: GameContext,
  pastimeId: string,
): { readonly placeId: string; readonly pastime: Pastime; readonly table: DiceTable } | null {
  const tavern = placeHere(state, ctx, 'tavern');
  const pastime = tavern?.pastimes?.find((p) => p.id === pastimeId);
  if (!tavern || pastime?.game?.kind !== 'dice') return null;
  return { placeId: tavern.id, pastime, table: pastime.game };
}

/** Rounds already played today, at any table. */
export function roundsTonight(state: GameState): number {
  const night = state.village.dice;
  return night?.day === state.time.day ? night.rounds : 0;
}

/** The last cup tonight, if you've played. */
export function lastThrowTonight(state: GameState): DiceThrow | null {
  const night = state.village.dice;
  return night?.day === state.time.day ? night.last : null;
}

/** How the next cup at this table will come up. */
export function nextCup(state: GameState, placeId: string, table: DiceTable): number[] {
  const round = roundsTonight(state);
  return Array.from(
    { length: table.dice },
    (_, die) => 1 + Math.floor(hashUnit(state.board.seed, state.time.day, placeId, round, die) * 6),
  );
}

export function callOf(faces: readonly number[]): DiceCall {
  return faces.reduce((sum, face) => sum + face, 0) % 2 === 0 ? 'even' : 'odd';
}

export function hearChance(perception: number): number {
  return Math.min(HEAR_MOST, HEAR_BASE + perception * HEAR_PER_PERCEPTION);
}

/** What you hear of the next cup as it settles, if anything. Always true when you do. */
export function heardCall(state: GameState, placeId: string, table: DiceTable): DiceCall | null {
  const round = roundsTonight(state);
  const ear = hashUnit(state.board.seed, state.time.day, placeId, round, 'hear');
  if (ear >= hearChance(state.character.stats.perception)) return null;
  return callOf(nextCup(state, placeId, table));
}

/** What a winning stake brings back on top of itself, after the house's cut. */
export function winnings(stake: number): number {
  return Math.round(stake * (1 - HOUSE_CUT));
}
