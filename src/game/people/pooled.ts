import type { PersonDef } from '@/content';
import { hashUnit } from '@/core';

import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * Which generated senseis a save meets (`sensei/pool/`). Every pack carries a whole pool of
 * them; a save draws a few from its seed, never the Rng, so the same save always meets the
 * same people: different pasts, temperaments, arts and names, so no two feel alike. Those
 * drawn live in the village like any jōnin and are offered with the authored senseis at team
 * assignment; the rest are elsewhere. Your own sensei is always here.
 */

/** Generated senseis living in the village in any one save. */
export const POOL_IN_VILLAGE = 4;

const drawn = new WeakMap<readonly PersonDef[], Map<number, readonly string[]>>();

function distinct(a: PersonDef, b: PersonDef): boolean {
  return (
    a.sensei?.pooled?.past !== b.sensei?.pooled?.past &&
    a.sensei?.pooled?.temperament !== b.sensei?.pooled?.temperament &&
    a.specialty !== b.specialty &&
    a.name !== b.name
  );
}

function draw(people: readonly PersonDef[], seed: number): readonly string[] {
  const pool = people
    .filter((p) => p.sensei?.pooled)
    .map((p) => ({ p, k: hashUnit(seed, 'sensei-pool', p.id) }))
    .sort((a, b) => a.k - b.k)
    .map(({ p }) => p);
  const chosen: PersonDef[] = [];
  for (const person of pool) {
    if (chosen.length >= POOL_IN_VILLAGE) break;
    if (chosen.every((c) => distinct(c, person))) chosen.push(person);
  }
  return chosen.map((p) => p.id);
}

/** The generated senseis this save meets, by id. */
export function drawnSenseis(state: GameState, ctx: GameContext): readonly string[] {
  const people = ctx.content.people.all;
  const bySeed = drawn.get(people) ?? new Map<number, readonly string[]>();
  drawn.set(people, bySeed);
  const known = bySeed.get(state.board.seed);
  if (known) return known;
  const ids = draw(people, state.board.seed);
  bySeed.set(state.board.seed, ids);
  return ids;
}

/** Whether someone is in this save's world: everyone is, but generated senseis not drawn. */
export function inThisWorld(state: GameState, ctx: GameContext, person: PersonDef): boolean {
  if (!person.sensei?.pooled) return true;
  return state.people.team?.senseiId === person.id || drawnSenseis(state, ctx).includes(person.id);
}
