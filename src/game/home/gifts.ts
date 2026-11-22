import { FIELD_BOOK_PAGES, type FurnishingDef, type PersonDef } from '@/content';
import { stageOf } from '@/systems/bonds';
import { addFurniture, ownsFurniture } from '@/systems/housing';

import type { GameContext } from '../context';
import { chip, log } from '../ops';
import { findPerson, inTownWith, whereNow } from '../people/cast';
import type { GameState } from '../state';

/**
 * The finest furniture is never sold: a close friend brings you a piece you don't have yet, the
 * first of the pack's gift pieces in order, once. Who has given is kept (`housing.givers`), so a
 * bond that dips below close friends and climbs back gives nothing more; the rule reads who is
 * a close friend now and who has given, never how the bond moved in one action. A happening
 * after each action (`happenings/`), so it follows a bond however it grew. They hand it over
 * only where they can find you; otherwise it is left at your door, and you find it when you are
 * next home (a more personal gift, given in hand, would wait for a meeting instead).
 */

/** The bond stage at which a friend brings a gift for the house. */
export const GIFT_STAGE = 3;

/** Close friends who have not given yet, in the order the bonds were made. */
function owingAGift(state: GameState): string[] {
  const { givers } = state.housing;
  return Object.entries(state.people.bonds)
    .filter(([id, bond]) => stageOf(bond.points) >= GIFT_STAGE && !givers.includes(id))
    .map(([id]) => id);
}

/** Pieces only a full page of the field book earns, never a friend's to give. */
function earned(ctx: GameContext): Set<string> {
  return new Set(
    FIELD_BOOK_PAGES.flatMap((page) => ctx.content.fieldBook[page].furnishingId ?? []),
  );
}

function handedOver(state: GameState, person: PersonDef, gift: FurnishingDef): GameState {
  return log(state, {
    heading: `A gift from ${person.name}`,
    text: `${person.name} turns up with something wrapped in cloth. “For the house. Don’t argue.”`,
    tone: 'success',
    chips: [chip(gift.name, 'gain')],
  });
}

/** Gifts left at the door while you were away, told as you are next home (a happening that needs it). */
export function giftsFoundAtTheDoor(state: GameState, ctx: GameContext): GameState {
  const { doorstep } = state.housing;
  if (doorstep.length === 0) return state;
  const cleared: GameState = { ...state, housing: { ...state.housing, doorstep: [] } };
  return doorstep.reduce<GameState>((now, left) => {
    const person = findPerson(now, ctx, left.fromId);
    const gift = ctx.content.furnishings.get(left.furnishingId);
    if (!person || !gift) return now;
    return log(now, {
      heading: `A gift from ${person.name}`,
      text: `Something wrapped in cloth waits at your door, a note tucked in the knot in ${person.name}’s hand: “For the house. Don’t argue.”`,
      tone: 'success',
      chips: [chip(gift.name, 'gain')],
    });
  }, cleared);
}

/** The gift given: the piece is yours, and the friend is remembered as having given. */
function given(
  state: GameState,
  person: PersonDef,
  gift: FurnishingDef,
  handed: boolean,
): GameState {
  const housing = addFurniture(state.housing, gift.id);
  const left = handed ? [] : [{ furnishingId: gift.id, fromId: person.id }];
  return {
    ...state,
    housing: {
      ...housing,
      givers: [...housing.givers, person.id],
      doorstep: [...housing.doorstep, ...left],
    },
  };
}

/**
 * A close friend's gift, once: handed over if they can find you (you are home and they are
 * about), else left at your door to be found when you are next home.
 */
export function giftsGiven(after: GameState, ctx: GameContext): GameState {
  const notGiven = earned(ctx);
  return owingAGift(after).reduce((state, id) => {
    const person = findPerson(state, ctx, id);
    const gift = ctx.content.furnishings.all.find(
      (f) => f.cost === undefined && !notGiven.has(f.id) && !ownsFurniture(state.housing, f.id),
    );
    // With every piece already yours, there is nothing to bring; they still owe the next one.
    if (!person || !gift) return state;
    // Each friend finds you or not by the one rule for being where someone is.
    const together = inTownWith(state, ctx, person) && whereNow(state, ctx, person) !== null;
    const gave = given(state, person, gift, together);
    return together ? handedOver(gave, person, gift) : gave;
  }, after);
}
