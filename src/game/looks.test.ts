import { describe, expect, it } from 'vitest';

import { DEFAULT_APPEARANCE } from '@/systems/profile';
import { ctx, newGame } from '@/test/gameFixtures';

import { personLook } from './people/looks';
import { shinobiView } from './views/shinobi';

const people = ctx.content.people.all;

describe('personLook', () => {
  it('gives every genin a young face and every kage an old one', () => {
    for (const person of people) {
      const { age } = personLook(person).face;
      if (person.rank === 'genin') expect(age).toBe('young');
      if (person.rank === 'kage') expect(age).toBe('old');
    }
  });

  it('draws the village with faces of its own, not one face recoloured', () => {
    const faces = new Set(people.map((p) => JSON.stringify(personLook(p).face)));
    expect(faces.size).toBe(people.length);
  });

  it('keeps a face an author gave someone', () => {
    const [someone] = people;
    if (!someone) throw new Error('the pack has people');
    const authored = { ...someone, appearance: DEFAULT_APPEARANCE };
    expect(personLook(authored).face).toEqual(DEFAULT_APPEARANCE.face);
  });
});

describe("the player's look", () => {
  it('gives a save from before faces a steady face of its own', () => {
    const state = newGame();
    const { face: _, ...faceless } = state.character.appearance;
    const old = { ...state, character: { ...state.character, appearance: faceless } };
    const first = shinobiView(old, ctx).appearance.face;
    expect(first.age).toBe('young');
    expect(shinobiView(old, ctx).appearance.face).toEqual(first);
  });
});
