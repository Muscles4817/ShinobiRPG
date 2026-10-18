import { newGame } from '@/test/gameFixtures';

import { deserialize } from './save';

describe('the telling memory migration', () => {
  it('gives a save from before it a memory of nothing said', () => {
    const { told: _told, ...older } = newGame();
    const loaded = deserialize(JSON.stringify({ version: 54, state: older }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.told).toEqual({});
  });
});
