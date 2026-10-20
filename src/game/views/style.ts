import { listed } from '@/core';
import type { TechniqueDef } from '@/systems/techniques';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { fitsStyle, styleMoveIds, styleRoom } from '../style';
import { choice, type Choice } from './common';

/**
 * Your style on the Jutsu tab: the body moves your strike plays from in a fight, how many it
 * holds, whether you chose them or the fight keeps your best, and on each body move you know,
 * the choice to put it in or take it out.
 */

export interface StyleView {
  /** The moves it holds now, by name, in the order chosen. */
  readonly moves: readonly string[];
  /** The same as a phrase: "Palm Strike, Arm Lock and Rising Gale". */
  readonly movesText: string;
  /** How many it holds at your taijutsu grade. */
  readonly room: number;
  /** You chose them; otherwise the fight keeps your best. */
  readonly chosen: boolean;
  /** Going back to keeping your best. */
  readonly reset: Choice;
}

/** One body move's place in your style, and the choice that changes it. */
export interface StyleSlot {
  readonly inStyle: boolean;
  readonly choice: Choice;
}

/** Your style, or null while you know no move that can be part of one. */
export function styleView(state: GameState, ctx: GameContext): StyleView | null {
  const ids = styleMoveIds(state, ctx);
  const anyFits = state.techniques.known.some((id) => {
    const def = ctx.content.techniques.get(id);
    return def !== undefined && fitsStyle(def);
  });
  if (!anyFits) return null;
  const moves = ids.map((id) => ctx.content.techniques.get(id)?.name ?? id);
  return {
    moves,
    movesText: listed(moves),
    room: styleRoom(state),
    chosen: state.techniques.repertoire !== null,
    reset: choice(state, ctx, { type: 'resetStyle' }),
  };
}

/** A known body move's place in your style (given the style's moves); null for anything else. */
export function styleSlot(
  state: GameState,
  ctx: GameContext,
  def: TechniqueDef,
  moves: readonly string[],
): StyleSlot | null {
  if (!state.techniques.known.includes(def.id) || !fitsStyle(def)) return null;
  const inStyle = moves.includes(def.id);
  const action = { type: 'setStyleMove', techniqueId: def.id, inStyle: !inStyle } as const;
  return { inStyle, choice: choice(state, ctx, action) };
}
