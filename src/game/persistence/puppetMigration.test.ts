import { newGame } from '@/test/gameFixtures';

import { deserialize } from './save';

describe('the puppet migration', () => {
  it('gives a save from before puppets of your own an empty workshop', () => {
    const { puppetry: _puppetry, ...older } = newGame();
    const loaded = deserialize(JSON.stringify({ version: 70, state: older }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.puppetry).toEqual({ puppets: [], craft: 0 });
  });
});
