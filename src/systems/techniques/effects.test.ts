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

  it('a ladder step is priced by its toll, never by a health price of its own', () => {
    const opens = { ladder: 'gates' as const, step: 3 };
    const gate = { verb: 'empower' as const, power: 10, boosts: ['speed' as const], opens };
    expect(effectProblem(gate)).toBeNull();
    expect(effectProblem({ ...gate, healthPerExchange: 4 })).toMatch(/toll is its price/);
    const { opens: _none, ...plain } = gate;
    expect(effectProblem(plain)).toMatch(/no price/);
  });
});
