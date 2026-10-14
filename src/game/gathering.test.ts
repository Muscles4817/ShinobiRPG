import { GRADE_XP } from '@/systems/cooking';
import { DAYS_PER_SEASON } from '@/systems/time';
import { act, ctx, lastEntry, newGame } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import type { GameState } from './state';
import { wildsView } from './views/wilds';

const SPRING = 1;
const AUTUMN = 2 * DAYS_PER_SEASON + 1;

function at(state: GameState, day: number, slot = 0): GameState {
  return { ...state, time: { day, slot }, board: { ...state.board, refreshedDay: day } };
}

describe('foraging', () => {
  it('finds what is in season, once a day per place', () => {
    const state = at(newGame(), AUTUMN);
    const view = wildsView(state, ctx, 'lantern-woods');
    expect(view?.forage.about.known).toEqual(['Wild Mushrooms', 'Chestnuts', 'Wild Ginger']);
    const after = act(state, { type: 'forage', placeId: 'lantern-woods' });
    const found = Object.keys(after.inventory.pantry);
    expect(found.length).toBeGreaterThan(0);
    expect(found.every((id) => ['wild-mushrooms', 'chestnuts', 'wild-ginger'].includes(id))).toBe(
      true,
    );
    expect(after.time.slot).toBe(1);
    expect(blockerFor(after, { type: 'forage', placeId: 'lantern-woods' }, ctx)).toBe(
      'You’ve already searched Lantern Woods today.',
    );
    expect(lastEntry(after)?.heading).toBe('Foraging in Lantern Woods');
  });

  it('what you would not know for food stays a mystery until your cooking grade allows', () => {
    const beginner = { ...newGame(), cooking: { ...newGame().cooking, xp: 0 } };
    const view = wildsView(at(beginner, SPRING), ctx, 'lantern-woods');
    expect(view?.forage.about).toEqual({
      known: ['Mountain Greens', 'Bamboo Shoots'],
      strange: 1,
    });
  });

  it('is hard work: it needs energy and a body fit for it', () => {
    const state = at(newGame(), SPRING);
    const tired = {
      ...state,
      character: { ...state.character, vitals: { ...state.character.vitals, energy: 5 } },
    };
    expect(blockerFor(tired, { type: 'forage', placeId: 'lantern-woods' }, ctx)).toBe(
      'Needs 10 energy. Nap or eat first.',
    );
    expect(blockerFor(state, { type: 'forage', placeId: 'nowhere' }, ctx)).toBe(
      'There’s nowhere like that here.',
    );
  });
});

describe('fishing', () => {
  it('each spot has its own catch by the hour, and gives once a day', () => {
    const evening = at(newGame(), SPRING, 2);
    const spots = wildsView(evening, ctx, 'canal-river')?.spots ?? [];
    expect(spots.map((s) => [s.id, s.bites.known])).toEqual([
      ['shallows', []],
      ['reeds', ['Crayfish', 'River Fish']],
      ['deep-pool', ['River Eel', 'River Fish']],
    ]);
    expect(
      blockerFor(evening, { type: 'fish', placeId: 'canal-river', spotId: 'shallows' }, ctx),
    ).toBe('Nothing you know bites here at this hour.');
    const after = act(evening, { type: 'fish', placeId: 'canal-river', spotId: 'deep-pool' });
    expect(after.cooking.gathered['canal-river:deep-pool']).toBe(SPRING);
    expect(
      blockerFor(after, { type: 'fish', placeId: 'canal-river', spotId: 'deep-pool' }, ctx),
    ).toBe('You’ve already fished the deep pool today.');
    // Another spot is still open the same day.
    expect(
      blockerFor(after, { type: 'fish', placeId: 'canal-river', spotId: 'reeds' }, ctx),
    ).toBeNull();
  });

  it('a patient angler usually lands something', () => {
    const calm = (seed: number) => {
      const state = at(newGame({ rngState: seed }), SPRING, 3);
      const steady = {
        ...state,
        character: { ...state.character, stats: { ...state.character.stats, willpower: 40 } },
        cooking: { ...state.cooking, xp: GRADE_XP.D },
      };
      const after = act(steady, { type: 'fish', placeId: 'canal-river', spotId: 'deep-pool' });
      return Object.keys(after.inventory.pantry).length;
    };
    const landed = [1, 2, 3, 4, 5, 6, 7, 8].filter((seed) => calm(seed) > 0).length;
    expect(landed).toBeGreaterThanOrEqual(6);
  });
});
