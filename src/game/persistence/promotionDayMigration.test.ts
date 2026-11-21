import { newGame } from '@/test/gameFixtures';

import { deserialize } from './save';

describe('the promotion day migration', () => {
  it('gives a save from before no promotion day and nothing at the door', () => {
    const game = newGame();
    const { promotionDay: _day, ...exams } = game.exams;
    const { doorstep: _door, ...housing } = game.housing;
    const older = { ...game, exams, housing };
    const loaded = deserialize(JSON.stringify({ version: 73, state: older }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.exams.promotionDay).toBeNull();
    expect(loaded.value.housing.doorstep).toEqual([]);
  });
});
