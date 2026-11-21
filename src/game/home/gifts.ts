import { FIELD_BOOK_PAGES, type FurnishingDef, type PersonDef } from '@/content';
import { stageOf } from '@/systems/bonds';
import { addFurniture, ownsFurniture } from '@/systems/housing';

import type { GameContext } from '../context';
import { chip, log } from '../ops';
import { atHomeVillage } from '../homeVillage';
import { findPerson, whereNow } from '../people/cast';
import type { GameState } from '../state';

/**
 * The finest furniture is never sold: a friend who becomes a close friend brings you a piece you
 * don't have yet, the first of the pack's gift pieces in order. Called from `dispatch`, so it
 * follows a bond however it grew. They hand it over only where they can find you; otherwise it is
 * left at your door, and you find it when you are next home (a more personal gift, given in
 * hand, would wait for a meeting instead).
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

function handedOver(state: GameState, person: PersonDef, gift: FurnishingDef): GameState {
  return log(state, {
    heading: `A gift from ${person.name}`,
    text: `${person.name} turns up with something wrapped in cloth. “For the house. Don’t argue.”`,
    tone: 'success',
    chips: [chip(gift.name, 'gain')],
  });
}

/** Gifts left at the door while you were away, told as you are next home. */
function foundAtTheDoor(state: GameState, ctx: GameContext): GameState {
  const { doorstep } = state.housing;
  if (doorstep.length === 0 || !atHomeVillage(state, ctx) || state.mission !== null) return state;
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

/**
 * A new close friend's gift: handed over if they can find you (you are home and they are about),
 * else left at your door to be found when you are next home.
 */
export function noteHomeGifts(before: GameState, after: GameState, ctx: GameContext): GameState {
  const notGiven = earned(ctx);
  const given = closer(before, after).reduce((state, id) => {
    const person = findPerson(state, ctx, id);
    const gift = ctx.content.furnishings.all.find(
      (f) => f.cost === undefined && !notGiven.has(f.id) && !ownsFurniture(state.housing, f.id),
    );
    if (!person || !gift) return state;
    const owned = { ...state, housing: addFurniture(state.housing, gift.id) };
    const together = atHomeVillage(state, ctx) && whereNow(state, ctx, person) !== null;
    if (together && state.mission === null) return handedOver(owned, person, gift);
    const left = { furnishingId: gift.id, fromId: person.id };
    return { ...owned, housing: { ...owned.housing, doorstep: [...owned.housing.doorstep, left] } };
  }, after);
  return foundAtTheDoor(given, ctx);
}
