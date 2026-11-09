import { newGame } from '@/test/gameFixtures';

import { deserialize } from './save';

describe('the journey migration', () => {
  it('gives a save from before journeys ended on the map no trip waiting to end', () => {
    const { journeyEnd: _new, ...older } = newGame();
    const loaded = deserialize(JSON.stringify({ version: 66, state: older }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.journeyEnd).toBeNull();
  });
});
