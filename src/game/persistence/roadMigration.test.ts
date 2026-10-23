import { newGame } from '@/test/gameFixtures';

import { deserialize } from './save';

describe('the road memory migration', () => {
  it('gives a save from before the road remembered an empty memory, keeping its map', () => {
    const game = newGame();
    const older = { ...game, atlas: { known: ['kiri-ford'], visited: [] } };
    const loaded = deserialize(JSON.stringify({ version: 68, state: older }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.atlas).toEqual({
      known: ['kiri-ford'],
      visited: [],
      recentRoad: [],
      roadSeen: [],
    });
  });
});
