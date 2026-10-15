import { CONTENT_PACKS } from '@/content';
import { signPass } from '@/systems/travel';
import { newGame } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { dispatch } from './dispatch';
import { PASS_DAYS, SAFE_ROADS_ONLY } from './leave';
import type { GameState } from './state';
import { travelView } from './views/travel';

const naruto = CONTENT_PACKS.find((p) => p.id === 'naruto');
const describeFan = naruto ? describe : describe.skip;

function withPass(state: GameState): GameState {
  return { ...state, leave: signPass(state.leave, state.time.day, PASS_DAYS) };
}

describeFan('the fan pack’s towns', () => {
  const ctx = createGameContext(naruto!);

  it('opens the Land of Waves and Tanzaku Town on the travel screen', () => {
    const open = travelView(newGame({}, ctx), ctx).destinations.filter(
      (d) => d.lockedReason === null,
    );
    expect(open.map((d) => d.id)).toEqual(
      expect.arrayContaining(['land-of-waves', 'tanzaku-town']),
    );
  });

  it('lets a genin on a pass reach Tanzaku Town, but not the Land of Waves', () => {
    const passed = withPass(newGame({}, ctx));
    expect(dispatch(passed, { type: 'travel', locationId: 'tanzaku-town' }, ctx).ok).toBe(true);
    expect(dispatch(passed, { type: 'travel', locationId: 'land-of-waves' }, ctx)).toEqual({
      ok: false,
      error: SAFE_ROADS_ONLY,
    });
  });

  it('meets the bridge builder’s family at home in the Land of Waves', () => {
    const residents = naruto!.people.filter((p) => p.homeLocationId === 'land-of-waves');
    expect(residents.map((p) => p.id)).toEqual(['tazuna', 'tsunami', 'inari']);
  });
});
