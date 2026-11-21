import { writeOrJoin } from '@/systems/journal';

import { ryoChip } from '../ops';
import type { GameState } from '../state';

/**
 * The record of small purchases (a pouch's tools, a pantry's groceries): one line per shop and
 * sitting, its ryo added up as more is bought, so the day's purse can say where the money went
 * without a line for every item.
 */

const SHOPPING_TEXT = 'You pay and pack it away.';

export function noteShopping(state: GameState, shopName: string, spent: number): GameState {
  // Headed by the shop, as the day's purse names the line.
  const heading = shopName;
  const entry = { heading, text: SHOPPING_TEXT, tone: 'info' as const, chips: [ryoChip(-spent)] };
  const journal = writeOrJoin(state.journal, state.time, entry, {
    joins: (last) => last.heading === heading,
    merge: (last) => {
      const before = (last.chips ?? []).reduce((sum, c) => sum + (c.ryo ?? 0), 0);
      return { ...entry, chips: [ryoChip(before - spent)] };
    },
  });
  return { ...state, journal };
}
