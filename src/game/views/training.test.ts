import { ctx, newGame } from '@/test/gameFixtures';

import { trainingView } from './training';

describe('training view', () => {
  it('lists each drill’s stats biggest gain first', () => {
    const drills = trainingView(newGame(), ctx)?.drills ?? [];
    expect(drills.length).toBeGreaterThan(0);
    for (const drill of drills) {
      const gains = drill.previews.map((p) => p.after - p.now);
      expect(gains).toEqual([...gains].sort((a, b) => b - a));
    }
  });
});
