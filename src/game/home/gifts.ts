import { FIELD_BOOK_PAGES } from '@/content';
import { stageOf } from '@/systems/bonds';
import { addFurniture, ownsFurniture } from '@/systems/housing';

import type { GameContext } from '../context';
import { chip, log } from '../ops';
import { findPerson } from '../people/cast';
import type { GameState } from '../state';

/**
 * The finest furniture is never sold: a friend who becomes a close friend brings you a piece you
 * don't have yet, the first of the pack's gift pieces in order. Called from `dispatch`, so it
 * follows a bond however it grew.
 */

/** The bond stage at which a friend brings a gift for the house. */
export const GIFT_STAGE = 3;

function closer(before: GameState, after: GameState): string[] {
  return Object.entries(after.people.bonds)
    .filter(([id, bond]) => {
      const was = before.people.bonds[id]?.points ?? 0;
      return stageOf(was) < GIFT_STAGE && stageOf(bond.points) >= GIFT_STAGE;
    })
    .map(([id]) => id);
}

/** Pieces only a full page of the field book earns, never a friend's to give. */
function earned(ctx: GameContext): Set<string> {
  return new Set(
    FIELD_BOOK_PAGES.flatMap((page) => ctx.content.fieldBook[page].furnishingId ?? []),
  );
}

export function noteHomeGifts(before: GameState, after: GameState, ctx: GameContext): GameState {
  const notGiven = earned(ctx);
  return closer(before, after).reduce((state, id) => {
    const person = findPerson(state, ctx, id);
    const gift = ctx.content.furnishings.all.find(
      (f) => f.cost === undefined && !notGiven.has(f.id) && !ownsFurniture(state.housing, f.id),
    );
    if (!person || !gift) return state;
    return log(
      { ...state, housing: addFurniture(state.housing, gift.id) },
      {
        heading: `A gift from ${person.name}`,
        text: `${person.name} turns up with something wrapped in cloth. “For the house. Don’t argue.”`,
        tone: 'success',
        chips: [chip(gift.name, 'gain')],
      },
    );
  }, after);
}
