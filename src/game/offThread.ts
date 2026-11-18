import { err, type Result } from '@/core';

import type { GameAction } from './actions/types';
import { contextForPack, type GameContext } from './context';
import { dispatch } from './dispatch';
import type { GameState } from './state';

/**
 * A step of play from the state alone, for a Web Worker that plays a fight off the main thread
 * (`docs/design/combat-ai-plan.md` Part 13b, Phase C3): a save knows its pack and keeps its own
 * copy of the edits, so the context is rebuilt from it (and kept while the pack and edits stay
 * the same). Play is deterministic, so this gives exactly what `dispatch` gives on the page.
 */

let kept: { readonly key: string; readonly ctx: GameContext } | null = null;

function contextOf(state: GameState): GameContext | null {
  const key = `${state.packId}:${JSON.stringify(state.edits)}`;
  if (kept?.key === key) return kept.ctx;
  const ctx = contextForPack(state.packId, state.edits);
  kept = ctx ? { key, ctx } : null;
  return ctx;
}

/** `dispatch`, with the context rebuilt from the state. */
export function dispatchAlone(state: GameState, action: GameAction): Result<GameState> {
  const ctx = contextOf(state);
  if (!ctx) return err(`No world called ${state.packId}.`);
  return dispatch(state, action, ctx);
}
