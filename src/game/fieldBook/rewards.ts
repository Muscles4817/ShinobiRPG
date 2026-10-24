import { FIELD_BOOK_PAGES } from '@/content';
import { markRewarded } from '@/systems/collections';
import { addFurniture } from '@/systems/housing';

import type { GameContext } from '../context';
import { chip, log } from '../ops';
import type { GameState } from '../state';
import { pageFull } from './pages';

/**
 * A page of the field book filled: its piece for the house (if it has one) and its keepsake,
 * once. Called from `dispatch`, so a page fills however the last entry was written.
 */

export const PAGE_TITLES: Readonly<Record<(typeof FIELD_BOOK_PAGES)[number], string>> = {
  fish: 'Fish',
  finds: 'Wild finds',
  recipes: 'Recipes',
  sights: 'Night sights',
  foes: 'Foes',
  places: 'Places',
};

export function noteFieldBook(before: GameState, state: GameState, ctx: GameContext): GameState {
  // Only something written in the book, a recipe learned or a place stood in can fill a page.
  const unchanged =
    before.fieldBook === state.fieldBook &&
    before.cooking.known === state.cooking.known &&
    before.atlas.visited === state.atlas.visited;
  if (unchanged) return state;
  return FIELD_BOOK_PAGES.filter(
    (page) => !state.fieldBook.rewarded.includes(page) && pageFull(state, ctx, page),
  ).reduce((s, page) => {
    const reward = ctx.content.fieldBook[page];
    const piece = reward.furnishingId ? ctx.content.furnishings.get(reward.furnishingId) : null;
    const housing = piece ? addFurniture(s.housing, piece.id) : s.housing;
    return log(
      { ...s, housing, fieldBook: markRewarded(s.fieldBook, page) },
      {
        heading: `A full page: ${PAGE_TITLES[page]}`,
        text: piece
          ? 'The last space on the page is filled in. Something to keep comes of it, and something for the house.'
          : 'The last space on the page is filled in. Something to keep comes of it.',
        tone: 'success',
        chips: [chip(reward.keepsake.name, 'gain'), ...(piece ? [chip(piece.name, 'gain')] : [])],
      },
    );
  }, state);
}
