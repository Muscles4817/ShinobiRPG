import { hashUnit } from '@/core';
import {
  lengthAt,
  recordCatch,
  recordFight,
  recordFinds,
  recordSight,
} from '@/systems/collections';
import type { JournalChip } from '@/systems/journal';

import type { GameContext } from '../context';
import { chip } from '../ops';
import type { GameState } from '../state';

/**
 * Writing in the field book as things happen: a catch measured (its length hashed from the seed,
 * the day and the spot, never the Rng, so a cast is the same however you got there), finds
 * gathered, a sight followed, a fight fought.
 */

const NEW_ENTRY = 'New in your field book';

export interface Landing {
  readonly state: GameState;
  /** The catch's length, and "New best" when it beat the last. */
  readonly chips: readonly JournalChip[];
}

/** The first of a kind is new in the book; a longer one after it is a new best. */
function bestChip(before: GameState, id: string, best: boolean): JournalChip[] {
  if (before.fieldBook.catches[id] === undefined) return [chip(NEW_ENTRY, 'gain')];
  return best ? [chip('New best', 'gain')] : [];
}

/** Says, on a find's chips, that something was written in the book for the first time. */
export function newEntryChips(before: GameState, ids: readonly string[]): JournalChip[] {
  return ids.some((id) => (before.fieldBook.finds[id] ?? 0) === 0) ? [chip(NEW_ENTRY, 'gain')] : [];
}

/** Measures a fish just landed at `spotKey` and writes it in. */
export function landCatch(
  state: GameState,
  ctx: GameContext,
  catchOf: { readonly ingredientId: string; readonly spotKey: string },
): Landing {
  const range = ctx.content.ingredients.get(catchOf.ingredientId)?.length;
  if (!range) return { state, chips: [] };
  const unit = hashUnit(state.board.seed, state.time.day, catchOf.spotKey, 'length');
  const length = lengthAt(range, unit);
  const landed = recordCatch(state.fieldBook, {
    id: catchOf.ingredientId,
    length,
    day: state.time.day,
  });
  return {
    state: { ...state, fieldBook: landed.book },
    chips: [chip(`${length} cm`, 'info'), ...bestChip(state, catchOf.ingredientId, landed.best)],
  };
}

export function noteFinds(state: GameState, ids: readonly string[]): GameState {
  return { ...state, fieldBook: recordFinds(state.fieldBook, ids) };
}

export function noteSight(state: GameState, sightId: string): GameState {
  return { ...state, fieldBook: recordSight(state.fieldBook, sightId) };
}

export function noteFight(state: GameState, foeIds: readonly string[], won: boolean): GameState {
  return { ...state, fieldBook: recordFight(state.fieldBook, foeIds, won) };
}
