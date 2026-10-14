import { CONTENT_PACKS } from '@/content';
import { act, newGame } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { dispatch } from './dispatch';
import type { GameState } from './state';
import { houseView } from './views/house';

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const ctx = createGameContext(original);
const PRICE = 2400;

/** A jōnin at Kiri Ford with savings, the village rent long overdue. */
function atTheFord(ryo = PRICE + 100): GameState {
  const game = newGame({}, ctx);
  return {
    ...game,
    locationId: 'kiri-ford',
    standing: { ...game.standing, rank: 'jonin' },
    wallet: { ryo },
    housing: { ...game.housing, paidThroughDay: 0 },
    time: { day: 20, slot: 1 },
  };
}

describe('a house of your own', () => {
  it('is for sale, and needs the price', () => {
    expect(houseView(atTheFord(), ctx)).toMatchObject({ price: PRICE, owned: false });
    expect(dispatch(atTheFord(PRICE - 1), { type: 'buyHouse' }, ctx)).toEqual({
      ok: false,
      error: `The house costs ${PRICE} ryo.`,
    });
    expect(dispatch(newGame({}, ctx), { type: 'buyHouse' }, ctx)).toEqual({
      ok: false,
      error: 'There is no house for sale here.',
    });
  });

  it('once bought is yours: sleep and nap there, rent or no rent', () => {
    expect(dispatch(atTheFord(), { type: 'sleep' }, ctx).ok).toBe(false);
    const bought = act(atTheFord(), { type: 'buyHouse' }, ctx);
    expect(bought.wallet.ryo).toBe(100);
    expect(bought.housing.owned).toEqual(['reed-row-house']);
    expect(dispatch(bought, { type: 'buyHouse' }, ctx)).toEqual({
      ok: false,
      error: 'It is yours already.',
    });
    // The village landlord's lock doesn't reach this far.
    const worn = {
      ...bought,
      character: {
        ...bought.character,
        vitals: { ...bought.character.vitals, energy: 10, health: 40 },
      },
    };
    expect(act(worn, { type: 'rest' }, ctx).character.vitals.energy).toBeGreaterThan(10);
    const slept = act(worn, { type: 'sleep' }, ctx);
    expect(slept.time.slot).toBe(0);
    expect(slept.character.vitals.health).toBeGreaterThan(40);
    expect(dispatch(bought, { type: 'payRent' }, ctx)).toEqual({
      ok: false,
      error: 'Your home is not in this village.',
    });
  });
});
