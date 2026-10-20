import { createStats } from './stats';
import { fightingPower, partyPower, STAT_MAX, statTier, statTierOf, withinScale } from './tiers';

describe('stat tiers', () => {
  it('grades a skill E–S by the rank whose average it is, and names the next step', () => {
    expect(statTier(6)).toEqual({
      grade: 'E',
      words: 'Genin',
      label: 'Genin E',
      min: 0,
      progress: 0.75,
      next: { label: 'Good genin D', at: 8 },
    });
    expect(statTier(15).label).toBe('Chūnin C');
    expect([20, 28].map((v) => statTier(v).label)).toEqual(['Jōnin B', 'Good jōnin A']);
    expect(statTier(1).grade).toBe('E');
  });

  it('runs S from 40 to the top of the scale', () => {
    expect(statTier(40)).toMatchObject({ grade: 'S', label: 'Elite S', progress: 0, next: null });
    expect(statTier(50).progress).toBeCloseTo(0.5);
    expect(statTier(STAT_MAX).progress).toBe(1);
    expect(withinScale(75)).toBe(STAT_MAX);
    expect(withinScale(-3)).toBe(0);
  });

  it('reads the body against athletes and the mind as its own', () => {
    expect(statTierOf('speed', 30).label).toBe('World class A');
    expect(statTierOf('strength', 45).words).toBe('Beyond human');
    expect(statTierOf('intellect', 24).label).toBe('Exceptional B');
    expect(statTierOf('chakraControl', 15).label).toBe('Chūnin C');
  });

  it('a specialist fights above their all-round level', () => {
    const allRound = createStats(6);
    const specialist = createStats(6, { taijutsu: 6 });
    expect(fightingPower(allRound)).toBe(6);
    expect(fightingPower(specialist)).toBe(9);
  });
});

describe('partyPower', () => {
  it('is a lone fighter’s own rating', () => {
    expect(partyPower([10])).toBeCloseTo(10);
  });

  it('grows with every body beside them, but two are less than twice one', () => {
    const pair = partyPower([10, 10]);
    expect(partyPower([10, 5])).toBeGreaterThan(10);
    expect(pair).toBeGreaterThan(partyPower([10, 5]));
    expect(pair).toBeLessThan(20);
  });
});
