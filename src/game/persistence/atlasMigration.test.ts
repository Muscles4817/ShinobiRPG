import { newGame } from '@/test/gameFixtures';

import { deserialize } from './save';

describe('the atlas migration', () => {
  it('gives a save from before the map was learned an atlas of where it stands', () => {
    const { atlas: _new, ...older } = { ...newGame(), locationId: 'port-shiomachi' };
    const loaded = deserialize(JSON.stringify({ version: 67, state: older }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.atlas).toMatchObject({ known: [], visited: ['port-shiomachi'] });
  });
});
