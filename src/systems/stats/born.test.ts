import { bornLine, bornMedian, normalFrom } from './born';
import { statTierOf } from './tiers';

describe('the body and mind a graduate is born with', () => {
  it('sits an ordinary graduate at athletic, men a little ahead in body on average', () => {
    const man = bornMedian('male');
    const woman = bornMedian('female');
    expect(statTierOf('speed', man.speed).words).toBe('Athletic');
    expect(man.strength).toBeGreaterThan(woman.strength);
    expect(man.speed).toBeGreaterThan(woman.speed);
    expect(man.reserves).toBe(woman.reserves);
    expect(man.intellect).toBe(woman.intellect);
  });

  it('spreads wide enough for a rare national-class body or a brilliant mind', () => {
    const outlier = bornLine('male', () => 3.2);
    expect(statTierOf('speed', outlier.speed).grade).toBe('B');
    expect(statTierOf('intellect', outlier.intellect).grade).toBe('B');
    // The curves overlap: a fast woman outruns most men.
    expect(bornLine('female', () => 1.5).speed).toBeGreaterThan(bornMedian('male').speed);
  });

  it('never falls below the floor', () => {
    expect(bornLine('female', () => -10).strength).toBe(1);
  });

  it('draws standard normals from uniforms', () => {
    expect(normalFrom(Math.exp(-0.5), 0)).toBeCloseTo(1);
    expect(normalFrom(1, 0.25)).toBeCloseTo(0);
  });
});
