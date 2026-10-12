import { costIsSane } from './costs';

describe('trump costs', () => {
  it('accepts positive days and amounts', () => {
    expect(costIsSane({ kind: 'hospital', days: 2 })).toBe(true);
    expect(costIsSane({ kind: 'injury', stat: 'perception', amount: 2, days: 5 })).toBe(true);
    expect(costIsSane({ kind: 'permanent', stat: 'stamina', amount: 1 })).toBe(true);
  });

  it('rejects empty costs', () => {
    expect(costIsSane({ kind: 'exhaustion', days: 0 })).toBe(false);
    expect(costIsSane({ kind: 'injury', stat: 'perception', amount: 0, days: 5 })).toBe(false);
    expect(costIsSane({ kind: 'permanent', stat: 'stamina', amount: -1 })).toBe(false);
  });
});
