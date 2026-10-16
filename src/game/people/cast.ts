import type { PersonDef } from '@/content';
import { NEW_BOND, type Bond, type Taste } from '@/systems/bonds';
import { slotName } from '@/systems/time';

import type { GameContext } from '../context';
import { homeVillageId } from '../homeVillage';
import type { GameState } from '../state';
import { inThisWorld } from './pooled';

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
  const here = ctx.content.people.all.filter((p) => inThisWorld(state, ctx, p));
  return [...here, ...state.people.generated];
}

export function bondOf(state: GameState, personId: string): Bond {
  return state.people.bonds[personId] ?? NEW_BOND;
}

/** Whether they live in the village (not a town elsewhere): crews, teams and dinners at home. */
export function isVillager(state: GameState, person: PersonDef, ctx: GameContext): boolean {
  return (person.homeLocationId ?? ctx.content.startLocationId) === homeVillageId(state, ctx);
}

/** Where a friend travelling with you is found: the inn here, or wherever you can find them. */
function lodging(state: GameState, ctx: GameContext): string | null {
  const { places } = ctx.content.locations.require(state.locationId);
  return (places.find((p) => p.kind === 'inn') ?? places[0])?.id ?? null;
}

/** Everyone who lives in the village. */
export function villagers(state: GameState, ctx: GameContext): readonly PersonDef[] {
  return everyone(state, ctx).filter((p) => isVillager(state, p, ctx));
}

/** The place id where this person is now, or null if they are away (or you are). */
export function whereNow(state: GameState, ctx: GameContext, person: PersonDef): string | null {
  if (person.id === state.people.companionId && !state.mission) return lodging(state, ctx);
  if (state.locationId !== (person.homeLocationId ?? ctx.content.startLocationId)) return null;
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

/** Who is at this place here right now (a bar's crowd, the bathers in the water). */
export function peopleAt(state: GameState, ctx: GameContext, placeId: string): PersonDef[] {
  return peopleHere(state, ctx)
    .filter((p) => p.placeId === placeId)
    .map((p) => p.person);
}
