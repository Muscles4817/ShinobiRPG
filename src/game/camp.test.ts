import { act, newGame } from '@/test/gameFixtures';
import { inTheDeep, RATION, wildCtx as ctx } from '@/test/wildCountry';

import { dispatch } from './dispatch';
import { campView } from './views/camp';

/** A night in camp in wild country: supper from your pack, and sleep under the sky. */

describe('making camp', () => {
  it('eats supper from your pack and sleeps till dawn under the sky', () => {
    const camped = act(inTheDeep(), { type: 'makeCamp' }, ctx);
    expect(camped.time).toEqual({ day: 2, slot: 0 });
    expect(camped.inventory.pantry[RATION.id]).toBe(1);
    expect(camped.journal.entries.map((e) => e.heading)).toContain('Camp at the Hollow');
  });

  it('says how many days of food you carry', () => {
    expect(campView(inTheDeep(), ctx)).toMatchObject({ name: 'The Hollow', rations: 2 });
  });

  it('needs a camp: in town you take a room', () => {
    expect(dispatch(newGame({}, ctx), { type: 'makeCamp' }, ctx)).toEqual({
      ok: false,
      error: 'There is nowhere to make camp here.',
    });
  });
});
