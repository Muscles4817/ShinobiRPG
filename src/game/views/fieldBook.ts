import { FIELD_BOOK_PAGES, type FieldBookPage } from '@/content';

import type { GameContext } from '../context';
import { FOES_PAGE_FULL, pageCount } from '../fieldBook/pages';
import { PAGE_TITLES } from '../fieldBook/rewards';
import type { GameState } from '../state';
import {
  findEntries,
  fishEntries,
  recipeEntries,
  sightEntries,
  sightsSealed,
  type FieldEntry,
} from './fieldBookEntries';
import { foeEntries } from './fieldBookFoes';
import { placeEntries } from './fieldBookPlaces';

/**
 * The field book in the Record tab: a page for each kind of thing out in the world, how full it
 * is, what a full page leaves you, and its entries (filled first, then the empty slots).
 */

export interface PageRewardView {
  /** The keepsake for the shelf. */
  readonly keepsake: string;
  /** The piece for the house, when the page has one, with what it is and where it is now. */
  readonly piece: { readonly name: string; readonly about: string } | null;
  readonly earned: boolean;
}

export interface FieldPage {
  readonly id: FieldBookPage;
  readonly title: string;
  /** The page's mark on its tab. */
  readonly seal: string;
  readonly filled: number;
  readonly total: number;
  readonly full: boolean;
  /** "3 of 6 caught". */
  readonly progress: string;
  /** What the page is for. */
  readonly note: string | null;
  /** Why the page can never fill for you (no slots are shown), or null. */
  readonly sealed: string | null;
  readonly entries: readonly FieldEntry[];
  readonly reward: PageRewardView;
}

export interface FieldBookView {
  readonly pages: readonly FieldPage[];
}

const SEALS: Readonly<Record<FieldBookPage, string>> = {
  fish: '魚',
  finds: '草',
  recipes: '膳',
  sights: '灯',
  foes: '敵',
  places: '旅',
};

const DONE_WORD: Readonly<Record<FieldBookPage, string>> = {
  fish: 'caught',
  finds: 'found',
  recipes: 'learned',
  sights: 'followed',
  foes: 'kinds beaten',
  places: 'been to',
};

function entriesOf(state: GameState, ctx: GameContext, page: FieldBookPage): FieldEntry[] {
  switch (page) {
    case 'fish':
      return fishEntries(state, ctx);
    case 'finds':
      return findEntries(state, ctx);
    case 'recipes':
      return recipeEntries(state, ctx);
    case 'sights':
      return sightEntries(state, ctx);
    case 'foes':
      return foeEntries(state, ctx);
    case 'places':
      return placeEntries(state, ctx);
  }
}

function noteOf(page: FieldBookPage): string | null {
  return page === 'foes'
    ? 'Every foe you fight gets an entry, and each fight adds to it. There are more kinds out there than the page needs.'
    : null;
}

/** What an earned or waiting piece is, and once earned, whether it stands at home yet. */
function pieceOf(state: GameState, ctx: GameContext, page: FieldBookPage): PageRewardView['piece'] {
  const id = ctx.content.fieldBook[page].furnishingId;
  const piece = id ? ctx.content.furnishings.get(id) : undefined;
  if (!piece) return null;
  const spot = `For the ${piece.spot} at home`;
  if (!state.fieldBook.rewarded.includes(page)) return { name: piece.name, about: `${spot}.` };
  const placed = Object.values(state.housing.placed).includes(piece.id);
  return {
    name: piece.name,
    about: placed ? 'In its place at home.' : `${spot}: waiting to be set in its place.`,
  };
}

function pageOf(state: GameState, ctx: GameContext, page: FieldBookPage): FieldPage {
  const { filled, total } = pageCount(state, ctx, page);
  const reward = ctx.content.fieldBook[page];
  const entries = entriesOf(state, ctx, page);
  return {
    id: page,
    title: PAGE_TITLES[page],
    seal: SEALS[page],
    filled,
    total,
    full: total > 0 && filled >= total,
    progress:
      page === 'foes'
        ? `${filled} of ${FOES_PAGE_FULL} ${DONE_WORD[page]}`
        : `${filled} of ${total} ${DONE_WORD[page]}`,
    note: noteOf(page),
    sealed: page === 'sights' ? sightsSealed(state, ctx) : null,
    entries: [...entries.filter((e) => e.found), ...entries.filter((e) => !e.found)],
    reward: {
      keepsake: reward.keepsake.name,
      piece: pieceOf(state, ctx, page),
      earned: state.fieldBook.rewarded.includes(page),
    },
  };
}

export function fieldBookView(state: GameState, ctx: GameContext): FieldBookView {
  return { pages: FIELD_BOOK_PAGES.map((page) => pageOf(state, ctx, page)) };
}
