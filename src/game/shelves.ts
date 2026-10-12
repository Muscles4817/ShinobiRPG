import type { PlaceDef } from '@/content';
import { RANKS, type Rank } from '@/systems/standing';
import type { StudySource } from '@/systems/techniques';

import type { GameContext } from './context';
import { placeHere } from './ops';
import type { GameState } from './state';
import { closedReason } from './village';

/**
 * Where scrolls are read: the academy's open rack (rank E–D), the library's restricted stacks
 * (C and some B, chūnin and above) and your own scrolls, read at home or in a library. Each is a
 * study source: the library's annotated copies teach a little better than a bare scroll.
 */

export type Shelf = Extract<PlaceDef, { kind: 'academy' | 'library' }>;

/** The lowest rank the library lets into its stacks. */
export const LIBRARY_RANK: Rank = 'chunin';
export const LIBRARY_LOCKED = 'The restricted stacks are for chūnin and above.';

/** Why you can't use the library's stacks, or null when your rank lets you in. */
export function libraryAccess(state: GameState): string | null {
  return RANKS.indexOf(state.standing.rank) < RANKS.indexOf(LIBRARY_RANK) ? LIBRARY_LOCKED : null;
}

export function sourceOf(shelf: Shelf): StudySource {
  return shelf.kind === 'library' ? 'library' : 'scroll';
}

/** The academy or library here that keeps this technique's scroll, if any. */
export function shelfHolding(
  state: GameState,
  ctx: GameContext,
  techniqueId: string,
): Shelf | undefined {
  return [placeHere(state, ctx, 'academy'), placeHere(state, ctx, 'library')].find((shelf) =>
    shelf?.techniqueIds.includes(techniqueId),
  );
}

/** Why the stacks or rack can't be used right now (closed, or the library's rank rule). */
export function shelfBlocker(state: GameState, shelf: Shelf): string | null {
  const locked = shelf.kind === 'library' ? libraryAccess(state) : null;
  return locked ?? closedReason(shelf.name, shelf.hours, state);
}

/** Why you can't sit down with your own scrolls here: at home, or in a library you may use. */
export function readingBlocker(state: GameState, ctx: GameContext): string | null {
  if (placeHere(state, ctx, 'home')) return null;
  const library = placeHere(state, ctx, 'library');
  return library ? shelfBlocker(state, library) : 'Read your scrolls at home or in a library.';
}
