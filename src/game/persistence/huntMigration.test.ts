import { newGame } from '@/test/gameFixtures';

import { deserialize } from './save';

describe('the hunt migration', () => {
  it('gives a save from before hunters a cold trail', () => {
    const { hunt: _new, ...older } = newGame();
    const loaded = deserialize(JSON.stringify({ version: 65, state: older }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.hunt).toEqual({ heat: 0 });
  });
});
