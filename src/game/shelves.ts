import type { PlaceDef } from '@/content';
import type { StudySource, TechniqueDef } from '@/systems/techniques';

import type { GameContext } from './context';
import { placeHere } from './ops';
import { isChuninOrAbove, LIBRARY_LOCKED, libraryEntry, libraryScrollAccess } from './permits';
import type { GameState } from './state';
import { closedReason } from './village';

/**
 * Where scrolls are read: the academy's open rack (rank E–D), the library's open shelves
 * (standard techniques to rank C, genin with their sensei's permit: `permits.ts`) and restricted
 * stacks (chūnin and above), and your own scrolls, read at home or in a library. Each is a
 * study source: the library's annotated copies teach a little better than a bare scroll.
 */

export type Shelf = Extract<PlaceDef, { kind: 'academy' | 'library' }>;

/** Why the library's restricted stacks are shut to you, or null when your rank lets you in. */
export function libraryAccess(state: GameState): string | null {
  return isChuninOrAbove(state) ? null : LIBRARY_LOCKED;
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

/**
 * Why the stacks or rack can't be used right now: closed, or the library's rules (for one
 * scroll when given, else for the library at all).
 */
export function shelfBlocker(state: GameState, shelf: Shelf, def?: TechniqueDef): string | null {
  const library = def ? libraryScrollAccess(state, def) : libraryEntry(state);
  const locked = shelf.kind === 'library' ? library : null;
  return locked ?? closedReason(shelf.name, shelf.hours, state);
}

/** Why you can't sit down with your own scrolls here: at home, or in a library you may use. */
export function readingBlocker(state: GameState, ctx: GameContext): string | null {
  if (placeHere(state, ctx, 'home')) return null;
  const library = placeHere(state, ctx, 'library');
  return library ? shelfBlocker(state, library) : 'Read your scrolls at home or in a library.';
}
