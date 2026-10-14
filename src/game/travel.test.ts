import { CONTENT_PACKS, type LocationDef } from '@/content';
import { act, newGame } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { dispatch } from './dispatch';
import { travelView } from './views/travel';

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const home = original.locations.find((l) => l.id === original.startLocationId)!;
const market = home.places.filter((p) => p.kind === 'market');

/** The original pack with the given locations opened up, each given a market. */
function opened(...ids: string[]) {
  return createGameContext({
    ...original,
    locations: original.locations.map((l): LocationDef => {
      if (!ids.includes(l.id)) return l;
      const { lockedReason: _opened, ...open } = l;
      return { ...open, places: market };
    }),
  });
}

const openRoads = opened('kiri-ford', 'sakyugakure');

describe('travel', () => {
  it('refuses destinations that are coming soon', () => {
    const ctx = createGameContext(original);
    expect(dispatch(newGame(), { type: 'travel', locationId: 'sakyugakure' }, ctx)).toEqual({
      ok: false,
      error: 'Coming soon',
    });
  });

  it('won’t take a road through a place that is still coming soon', () => {
    const ctx = opened('sakyugakure');
    expect(dispatch(newGame({}, ctx), { type: 'travel', locationId: 'sakyugakure' }, ctx)).toEqual({
      ok: false,
      error: 'No open road goes there yet.',
    });
  });

  it('moves you along the routes, costs ryo and days, and changes what you can do', () => {
    const start = newGame({}, openRoads);
    const arrived = act(start, { type: 'travel', locationId: 'sakyugakure' }, openRoads);
    expect(arrived.locationId).toBe('sakyugakure');
    expect(arrived.time.day).toBe(4);
    expect(arrived.wallet.ryo).toBe(start.wallet.ryo - 120);
    expect(dispatch(arrived, { type: 'sleep' }, openRoads)).toEqual({
      ok: false,
      error: 'Your home is not in this village.',
    });
    expect(dispatch(arrived, { type: 'eat', foodId: 'rice-ball' }, openRoads).ok).toBe(true);
  });

  it('shows the way, the worst of the road and the places passed', () => {
    const dunes = travelView(newGame({}, openRoads), openRoads).find((d) => d.id === 'sakyugakure');
    expect(dunes).toMatchObject({
      days: 3,
      cost: 120,
      danger: 'Bandits about',
      via: 'By way of Kiri Ford',
      lockedReason: null,
      blocker: null,
    });
  });

  it('shows a locked place with the road it will have', () => {
    const ctx = createGameContext(original);
    const mountain = travelView(newGame(), ctx).find((d) => d.id === 'mount-reikon');
    expect(mountain).toMatchObject({
      days: 4,
      danger: 'Dangerous road',
      lockedReason: 'Needs Chūnin rank',
    });
  });
});
