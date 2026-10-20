import {
  BODY_ARTS,
  CHAINS_KEPT,
  chainProblem,
  defaultChains,
  defaultRepertoire,
  fitsChain,
  fitsRepertoire,
  isBodyArt,
  repertoireSize,
  type BodyArt,
} from '@/systems/combat';
import type { TechniqueDef } from '@/systems/techniques';

import { playerCombatant } from './combatants';
import type { GameContext } from './context';
import type { GameState } from './state';

/**
 * Your style: the body moves your strike plays from in a fight (`engines/plan/repertoire.ts`),
 * in each art you strike in: taijutsu with bare hands, kenjutsu forms with a weapon in hand. You
 * may choose them from what you know, as many as your grade in the art holds; until you do (or
 * once you set it back, or for an art you named nothing in), a fight keeps your best. Chains are
 * kept the same way: as you built them, or built from what you know. Read the style only
 * through here.
 */

/** The art a body move belongs to, or null for anything that isn't one. */
export function styleArtOf(def: TechniqueDef): BodyArt | null {
  return fitsRepertoire(def) && isBodyArt(def.discipline) ? def.discipline : null;
}

/** The moves your style holds now in one art: as you chose them, or your best. */
export function styleMoveIdsIn(state: GameState, ctx: GameContext, art: BodyArt): string[] {
  const you = playerCombatant(state, ctx);
  const known = you.techniques.filter((t) => fitsRepertoire(t) && t.discipline === art);
  const chosen = known.filter((t) => state.techniques.repertoire?.includes(t.id));
  return chosen.length > 0 ? chosen.map((t) => t.id) : defaultRepertoire(you, art);
}

/** The moves your style holds now, in every art. */
export function styleMoveIds(state: GameState, ctx: GameContext): readonly string[] {
  return BODY_ARTS.flatMap((art) => styleMoveIdsIn(state, ctx, art));
}

/** How many moves your style holds in an art at your grade in it. */
export function styleRoom(state: GameState, art: BodyArt): number {
  return repertoireSize(state.character.stats[art]);
}

/** Whether a technique can be part of a style: a plain body move that strikes. */
export function fitsStyle(def: TechniqueDef): boolean {
  return styleArtOf(def) !== null;
}

/**
 * A body move learned since the last action joins a chosen style while its art has room, so a
 * new move is used without a trip to the Jutsu tab (a style left to keep your best takes it
 * anyway).
 */
export function noteNewMoves(before: GameState, state: GameState, ctx: GameContext): GameState {
  const chosen = state.techniques.repertoire;
  if (!chosen || before.techniques.known === state.techniques.known) return state;
  const learned = state.techniques.known.filter((id) => !before.techniques.known.includes(id));
  const joining = BODY_ARTS.flatMap((art) => {
    const fresh = learned.filter((id) => {
      const def = ctx.content.techniques.get(id);
      return def && styleArtOf(def) === art && !chosen.includes(id);
    });
    const held = chosen.filter((id) => {
      const def = ctx.content.techniques.get(id);
      return def && styleArtOf(def) === art;
    });
    return fresh.slice(0, Math.max(0, styleRoom(state, art) - held.length));
  });
  if (joining.length === 0) return state;
  return { ...state, techniques: { ...state.techniques, repertoire: [...chosen, ...joining] } };
}

/** The chains a strike may open now: as you built them, or built from what you know. */
export function chainIds(state: GameState, ctx: GameContext): readonly (readonly string[])[] {
  if (state.techniques.chains) return state.techniques.chains;
  const you = playerCombatant(state, ctx);
  return defaultChains(you.techniques, you.attributes);
}

/** A chain's moves, as the pack has them (unknown ids left out). */
export function chainLinks(ids: readonly string[], ctx: GameContext): TechniqueDef[] {
  return ids.flatMap((id) => ctx.content.techniques.get(id) ?? []);
}

/** Why a chain of these moves can't be kept, or null when every link follows. */
export function chainBlocker(
  state: GameState,
  ctx: GameContext,
  ids: readonly string[],
): string | null {
  if (ids.some((id) => !state.techniques.known.includes(id))) return 'You don’t know every move.';
  return chainProblem(chainLinks(ids, ctx), state.character.stats);
}

/** How many chains you keep in the art of this one, and whether there is room for another. */
export function chainRoomFor(state: GameState, ctx: GameContext, ids: readonly string[]): boolean {
  const art = chainLinks(ids, ctx)[0]?.discipline;
  const kept = chainIds(state, ctx).filter((c) => chainLinks(c, ctx)[0]?.discipline === art);
  return kept.length < CHAINS_KEPT;
}

/** Whether a technique can be a link of a chain: a plain body move that strikes. */
export function fitsChainLink(def: TechniqueDef): boolean {
  return fitsChain(def);
}
