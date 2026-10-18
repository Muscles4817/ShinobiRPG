import { createRng, err, ok, type Result } from '@/core';

import { HANDLERS } from './actions/registry';
import type { ActionHandler, GameAction } from './actions/types';
import type { GameContext } from './context';
import { noteDayEnd } from './daybook/record';
import { noteFieldBook } from './fieldBook/rewards';
import { noteHomeGifts } from './home/gifts';
import { noteRival } from './rival/record';
import { notePromotions } from './exam/promotion';
import { noteGradeUps } from './gradeUps';
import type { GameState } from './state';

function handlerFor<A extends GameAction>(action: A): ActionHandler<A> {
  // The registry's mapped type guarantees HANDLERS[action.type] handles exactly `A`.
  return HANDLERS[action.type] as unknown as ActionHandler<A>;
}

/** Why `action` is not allowed right now, or null if it is. Used by the UI to disable buttons. */
export function blockerFor(state: GameState, action: GameAction, ctx: GameContext): string | null {
  return handlerFor(action).check(state, action, ctx);
}

/**
 * The single entry point for changing game state. Pure and deterministic: the same state,
 * action and context always produce the same result (randomness comes from `state.rngState`).
 * Whatever grew a stat into a new grade, the moment is noted here, once (`noteGradeUps`), and
 * unstable techniques the new grades have caught up with steady (see `gradeUps.ts`), and a
 * jōnin's nomination arrives once it is earned (`exam/promotion.ts`), and a day that ended is
 * closed into the day's record (`daybook/record.ts`), and a full page of the field book leaves
 * its reward (`fieldBook/rewards.ts`).
 */
export function dispatch(
  state: GameState,
  action: GameAction,
  ctx: GameContext,
): Result<GameState> {
  const handler = handlerFor(action);
  const blocker = handler.check(state, action, ctx);
  if (blocker) return err(blocker);

  const rng = createRng(state.rngState);
  const performed = handler.perform(state, action, ctx, rng);
  const graded = notePromotions(noteGradeUps(state, performed, ctx), ctx);
  const gifted = noteHomeGifts(state, noteRival(state, graded, ctx), ctx);
  const next = noteDayEnd(state, noteFieldBook(state, gifted, ctx), action);
  return ok({ ...next, rngState: rng.state() });
}
