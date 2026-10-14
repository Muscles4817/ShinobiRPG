import { ctx, lastEntry, newGame } from '@/test/gameFixtures';

import { takeSpoils } from './spoils';

describe('spoils', () => {
  it('a beaten beast leaves its meat in your pack; a bandit leaves nothing for the pot', () => {
    const state = newGame();
    const after = takeSpoils(state, ctx, ['feral-tanuki', 'bandit-thug', 'feral-tanuki']);
    expect(after.inventory.pantry['wild-game']).toBe(2);
    expect(lastEntry(after)?.chips).toEqual([
      { label: 'Wild Game', tone: 'gain' },
      { label: 'Wild Game', tone: 'gain' },
    ]);
    expect(takeSpoils(state, ctx, ['bandit-thug'])).toBe(state);
  });
});
