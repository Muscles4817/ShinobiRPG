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
      travellers: {},
    });
  });

  it('gives a save from before the road had people on it nobody met, keeping what it brought', () => {
    const game = newGame();
    const { travellers: _travellers, ...older } = { ...game.atlas, recentRoad: ['downpour'] };
    const loaded = deserialize(JSON.stringify({ version: 69, state: { ...game, atlas: older } }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.atlas.travellers).toEqual({});
    expect(loaded.value.atlas.recentRoad).toEqual(['downpour']);
  });
});
