import { CONTENT_PACKS } from '@/content';
import { bondWith } from '@/systems/bonds';
import { act, newGame } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { blockerFor } from './dispatch';
import { peopleHere } from './people/cast';
import type { GameState } from './state';

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const ctx = createGameContext(original);

const MORNING = 0;
const ACQUAINTED = 10;

function out(locationId: string, personId: string, points = ACQUAINTED): GameState {
  const state = newGame({}, ctx);
  return {
    ...state,
    locationId,
    time: { ...state.time, slot: MORNING },
    wallet: { ryo: 100 },
    people: {
      ...state.people,
      bonds: { ...state.people.bonds, [personId]: bondWith(points) },
    },
  };
}

describe('the hermit of the Cedar Deep and the keeper of the Old Battlefield', () => {
  it('are met where they live, and never in the village', () => {
    const home = newGame({}, ctx);
    const here = peopleHere(home, ctx).map((p) => p.person.id);
    expect(here).not.toContain('oboro');
    expect(here).not.toContain('gonzo');
    const deep = peopleHere(out('cedar-deep', 'oboro'), ctx);
    expect(deep.find((p) => p.person.id === 'oboro')?.placeId).toBe('cedar-deep-paths');
    const field = peopleHere(out('old-battlefield', 'gonzo'), ctx);
    expect(field.find((p) => p.person.id === 'gonzo')?.placeId).toBe('old-battlefield-rows');
  });

  it('teach on their own ground once you know them', () => {
    const lesson = { type: 'trainWith', personId: 'oboro', statId: 'perception' } as const;
    expect(blockerFor(out('cedar-deep', 'oboro', 0), lesson, ctx)).not.toBeNull();
    const state = out('cedar-deep', 'oboro');
    expect(blockerFor(state, lesson, ctx)).toBeNull();
    const after = act(state, lesson, ctx);
    expect(after.character.stats.perception).toBeGreaterThan(state.character.stats.perception);
  });

  it('the keeper asks incense money for the field as well', () => {
    const lesson = { type: 'trainWith', personId: 'gonzo', statId: 'kenjutsu' } as const;
    const state = out('old-battlefield', 'gonzo');
    expect(blockerFor({ ...state, wallet: { ryo: 0 } }, lesson, ctx)).not.toBeNull();
    const after = act(state, lesson, ctx);
    expect(after.wallet.ryo).toBe(state.wallet.ryo - 20);
    expect(after.character.stats.kenjutsu).toBeGreaterThan(state.character.stats.kenjutsu);
  });

  it('each teach a school of their own', () => {
    const schools = (id: string) =>
      original.people
        .find((p) => p.id === id)
        ?.teacher?.teaches.map((t) => original.techniques.find((d) => d.id === t)?.school);
    expect(schools('oboro')).toEqual(['Moss Step', 'Moss Step']);
    expect(schools('gonzo')).toEqual(['Gravefield', 'Gravefield']);
  });
});
