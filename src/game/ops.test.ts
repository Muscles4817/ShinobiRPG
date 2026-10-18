import { act, lastEntry, newGame } from '@/test/gameFixtures';

import { amountChip, amountWords, statChips } from './ops';

describe('chips', () => {
  it('shows whole amounts as numbers and small ones as words', () => {
    expect(amountWords(2.4)).toBe('+2');
    expect(amountWords(-3)).toBe('−3');
    expect(amountWords(0.2)).toBe('a little');
    expect(amountWords(0.01)).toBe('a touch');
    expect(amountWords(-0.2)).toBe('a little less');
    expect(amountWords(0)).toBeNull();
  });

  it('never makes a chip of nothing', () => {
    expect(amountChip('Health', 0, 'gain')).toEqual([]);
    expect(statChips({ strength: 0.13, speed: 1.2 }).map((c) => c.label)).toEqual([
      'Strength, a little',
      'Speed +1',
    ]);
  });

  it('shows small growth from a drill without fractions or zeros', () => {
    const trained = act(newGame(), { type: 'train', trainingId: 'lake-laps' });
    const labels = (lastEntry(trained)?.chips ?? []).map((c) => c.label);
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) expect(label).not.toMatch(/\d\.\d|[+−-]0\b/);
  });

  it('leaves out a health chip when a night heals nothing', () => {
    const slept = act(newGame(), { type: 'sleep' });
    const labels = slept.journal.entries.flatMap((e) => e.chips ?? []).map((c) => c.label);
    expect(labels).toContain('Energy & chakra restored');
    expect(labels).not.toContain('Health +0');
  });
});
