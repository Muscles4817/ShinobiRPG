import type { PersonDef } from '@/content';
import { NEW_BOND, type Bond, type Taste } from '@/systems/bonds';
import { slotName } from '@/systems/time';

import type { GameContext } from '../context';
import type { GameState } from '../state';

/** Looking people up, wherever they are defined, and finding who is around right now. */

export function findPerson(state: GameState, ctx: GameContext, id: string): PersonDef | undefined {
  return ctx.content.people.get(id) ?? state.people.generated.find((p) => p.id === id);
}

export function requirePerson(state: GameState, ctx: GameContext, id: string): PersonDef {
  const person = findPerson(state, ctx, id);
  if (!person) throw new Error(`Unknown person id "${id}"`);
  return person;
}

/** Authored people first, then generated classmates. */
export function everyone(state: GameState, ctx: GameContext): readonly PersonDef[] {
  return [...ctx.content.people.all, ...state.people.generated];
}

export function bondOf(state: GameState, personId: string): Bond {
  return state.people.bonds[personId] ?? NEW_BOND;
}

/** The place id where this person is now, or null if they are away. */
export function whereNow(state: GameState, ctx: GameContext, person: PersonDef): string | null {
  if (state.locationId !== ctx.content.startLocationId) return null;
  return person.schedule[slotName(state.time)];
}

export interface Presence {
  readonly person: PersonDef;
  readonly placeId: string;
}

export function peopleHere(state: GameState, ctx: GameContext): Presence[] {
  return everyone(state, ctx).flatMap((person) => {
    const placeId = whereNow(state, ctx, person);
    return placeId === null ? [] : [{ person, placeId }];
  });
}

export function tastesOf(person: PersonDef, ctx: GameContext): Taste[] {
  return person.traitIds.flatMap((id) => {
    const trait = ctx.content.traits.get(id);
    return trait ? [trait] : [];
  });
}

export function fullName(person: PersonDef): string {
  return person.familyName ? `${person.name} ${person.familyName}` : person.name;
}
