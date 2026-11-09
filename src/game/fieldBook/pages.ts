import type { FieldBookPage } from '@/content';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { hasBeenTo } from '../atlas';
import { placesOnTheBook } from './places';
import { findsWhere, fishWhere } from './wild';

/**
 * How full each page of the field book is: the fish and the finds the pack's wild places hold,
 * every recipe, every night sight, every place you can stand in, and kinds of foe beaten (the foes page fills at
 * `FOES_PAGE_FULL`, since nobody meets every foe there is).
 */

/** Kinds of foe beaten to fill the foes page. */
export const FOES_PAGE_FULL = 12;

export interface PageCount {
  readonly filled: number;
  readonly total: number;
}

function counted(ids: readonly string[], has: (id: string) => boolean): PageCount {
  return { filled: ids.filter(has).length, total: ids.length };
}

export function pageCount(state: GameState, ctx: GameContext, page: FieldBookPage): PageCount {
  const book = state.fieldBook;
  switch (page) {
    case 'fish':
      return counted([...fishWhere(ctx).keys()], (id) => book.catches[id] !== undefined);
    case 'finds':
      return counted([...findsWhere(ctx).keys()], (id) => (book.finds[id] ?? 0) > 0);
    case 'recipes':
      return counted(
        ctx.content.recipes.all.map((r) => r.id),
        (id) => state.cooking.known[id] !== undefined,
      );
    case 'sights':
      return counted(
        ctx.content.village.sights.map((s) => s.id),
        (id) => book.sights.includes(id),
      );
    case 'foes': {
      const beaten = Object.values(book.foes).filter((f) => f.beaten > 0).length;
      return { filled: Math.min(beaten, FOES_PAGE_FULL), total: FOES_PAGE_FULL };
    }
    case 'places':
      return counted(
        placesOnTheBook(ctx).map((l) => l.id),
        (id) => hasBeenTo(state, ctx, id),
      );
  }
}

export function pageFull(state: GameState, ctx: GameContext, page: FieldBookPage): boolean {
  const { filled, total } = pageCount(state, ctx, page);
  return total > 0 && filled >= total;
}
