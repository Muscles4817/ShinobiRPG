import { effectProblem } from './effects';

describe('effect validation', () => {
  it('a clone’s kind must agree with whether it strikes', () => {
    expect(effectProblem({ verb: 'clone', power: 10, strikes: true, kind: 'earth' })).toBeNull();
    expect(effectProblem({ verb: 'clone', power: 6, kind: 'illusion' })).toBeNull();
    expect(effectProblem({ verb: 'clone', power: 6, kind: 'shadow' })).toMatch(/disagree/);
    expect(effectProblem({ verb: 'clone', power: 6, strikes: true, kind: 'illusion' })).toMatch(
      /disagree/,
    );
  });
});
