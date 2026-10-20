import {
  chainProblem,
  defaultChains,
  defaultRepertoire,
  fitsChain,
  fitsRepertoire,
  repertoireSize,
} from '@/systems/combat';
import type { TechniqueDef } from '@/systems/techniques';

import { playerCombatant } from './combatants';
import type { GameContext } from './context';
import type { GameState } from './state';

/**
 * Your style: the body moves your strike plays from in a fight (`engines/plan/repertoire.ts`).
 * You may choose them from what you know, as many as your taijutsu grade holds; until you do (or
 * once you set it back), a fight keeps your best. Chains are kept the same way: as you built
 * them, or built from what you know. Read the style only through here.
 */

/** The moves your style holds now: as you chose them, or your best. */
export function styleMoveIds(state: GameState, ctx: GameContext): readonly string[] {
  const you = playerCombatant(state, ctx);
  const known = new Set(you.techniques.filter(fitsRepertoire).map((t) => t.id));
  const chosen = state.techniques.repertoire;
  return chosen ? chosen.filter((id) => known.has(id)) : defaultRepertoire(you);
}

/** How many moves your style holds at your taijutsu grade. */
export function styleRoom(state: GameState): number {
  return repertoireSize(state.character.stats.taijutsu);
}

/** Whether a technique can be part of a style: a plain body move that strikes. */
export function fitsStyle(def: TechniqueDef): boolean {
  return fitsRepertoire(def);
}

/**
 * A body move learned since the last action joins a chosen style while it has room, so a new
 * move is used without a trip to the Jutsu tab (a style left to keep your best takes it anyway).
 */
export function noteNewMoves(before: GameState, state: GameState, ctx: GameContext): GameState {
  const chosen = state.techniques.repertoire;
  if (!chosen || before.techniques.known === state.techniques.known) return state;
  const learned = state.techniques.known.filter((id) => !before.techniques.known.includes(id));
  const fresh = learned.filter((id) => {
    const def = ctx.content.techniques.get(id);
    return def !== undefined && fitsStyle(def) && !chosen.includes(id);
  });
  const room = Math.max(0, styleRoom(state) - chosen.length);
  if (fresh.length === 0 || room === 0) return state;
  const repertoire = [...chosen, ...fresh.slice(0, room)];
  return { ...state, techniques: { ...state.techniques, repertoire } };
}

/** The chains a strike may open now: as you built them, or built from what you know. */
export function chainIds(state: GameState, ctx: GameContext): readonly (readonly string[])[] {
  if (state.techniques.chains) return state.techniques.chains;
  const you = playerCombatant(state, ctx);
  return defaultChains(you.techniques, you.attributes.taijutsu);
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
  return chainProblem(chainLinks(ids, ctx), state.character.stats.taijutsu);
}

/** Whether a technique can be a link of a chain: a plain body move that strikes. */
export function fitsChainLink(def: TechniqueDef): boolean {
  return fitsChain(def);
}
