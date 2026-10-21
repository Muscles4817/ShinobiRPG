import { listed } from '@/core';
import { BODY_ARTS, type BodyArt } from '@/systems/combat';
import type { TechniqueDef } from '@/systems/techniques';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { fitsStyle, styleArtOf, styleMoveIdsIn, styleRoom } from '../style';
import { choice, type Choice } from './common';

/**
 * Your style on the Jutsu tab: the body moves your strike plays from in a fight, in each art
 * (bare hands, a weapon in hand), how many each holds, whether you chose them or the fight keeps your best, and on each body move you know,
 * the choice to put it in or take it out.
 */

/** Your style in one art: the moves it holds and how many it may. */
export interface StyleGroup {
  readonly art: BodyArt;
  /** How you strike in it: "With bare hands", "With a weapon in hand". */
  readonly lead: string;
  /** The moves it holds now, by name. */
  readonly moves: readonly string[];
  /** The same as a phrase: "Palm Strike, Arm Lock and Rising Gale". */
  readonly movesText: string;
  /** How many it holds at your grade in the art. */
  readonly room: number;
}

export interface StyleView {
  /** Each art you know a move of, bare hands first. */
  readonly groups: readonly StyleGroup[];
  /** You chose them; otherwise the fight keeps your best. */
  readonly chosen: boolean;
  /** Going back to keeping your best. */
  readonly reset: Choice;
}

const LEADS: Readonly<Record<BodyArt, string>> = {
  taijutsu: 'With bare hands',
  kenjutsu: 'With a weapon in hand',
};

/** One body move's place in your style, and the choice that changes it. */
export interface StyleSlot {
  readonly inStyle: boolean;
  readonly choice: Choice;
}

/** Your style, or null while you know no move that can be part of one. */
export function styleView(state: GameState, ctx: GameContext): StyleView | null {
  const groups = BODY_ARTS.flatMap((art): StyleGroup[] => {
    const knows = state.techniques.known.some((id) => {
      const def = ctx.content.techniques.get(id);
      return def !== undefined && styleArtOf(def) === art;
    });
    if (!knows) return [];
    const moves = styleMoveIdsIn(state, ctx, art).map(
      (id) => ctx.content.techniques.get(id)?.name ?? id,
    );
    const room = styleRoom(state, art);
    return [{ art, lead: LEADS[art], moves, movesText: listed(moves), room }];
  });
  if (groups.length === 0) return null;
  return {
    groups,
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
