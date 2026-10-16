import { canClimb, highestReachable, ladderStepProblem, stepWords } from './ladders';

describe('ladders', () => {
  it('climbs a few steps at a time, never down or in place', () => {
    expect(canClimb(0, 3)).toBe(true);
    expect(canClimb(3, 7)).toBe(true);
    expect(canClimb(0, 7)).toBe(false);
    expect(canClimb(3, 3)).toBe(false);
    expect(canClimb(6, 5)).toBe(false);
  });

  it('reaches as high as its openings climb, each from one already open', () => {
    expect(highestReachable([1, 3, 7, 8])).toBe(8);
    expect(highestReachable([7, 3])).toBe(7);
    expect(highestReachable([6, 8])).toBe(0);
    expect(highestReachable([])).toBe(0);
  });

  it('knows its steps, and tells them in words', () => {
    expect(ladderStepProblem({ ladder: 'gates', step: 8 })).toBeNull();
    expect(ladderStepProblem({ ladder: 'gates', step: 0 })).toMatch(/runs 1 to 8/);
    expect(stepWords({ ladder: 'gates', step: 3 })).toBe('the third gate');
  });
});
