import { CONTENT_PACKS } from '@/content';
import { act, newGame } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { dispatch } from './dispatch';

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const [home, dunes] = original.locations;

/** The original pack with Sakyūgakure opened up and given a market. */
const openRoads = createGameContext({
  ...original,
  locations: [
    home!,
    {
      ...dunes!,
      travel: { days: 3, cost: 120, danger: 'Bandits: low' },
      places: home!.places.filter((p) => p.kind === 'market'),
    },
  ],
});

describe('travel', () => {
  it('refuses destinations that are coming soon', () => {
    const ctx = createGameContext(original);
    expect(dispatch(newGame(), { type: 'travel', locationId: 'sakyugakure' }, ctx)).toEqual({
      ok: false,
      error: 'Coming soon',
    });
  });

  it('moves you, costs ryo and days, and changes what you can do', () => {
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
});
