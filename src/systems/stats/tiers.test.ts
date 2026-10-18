import { createStats } from './stats';
import { fightingPower, partyPower, statTier } from './tiers';

describe('stat tiers', () => {
  it('grades a value E–S with its shinobi rank, and names the next step', () => {
    expect(statTier(6)).toEqual({
      grade: 'E',
      rank: 'Genin',
      label: 'Genin E',
      min: 0,
      progress: 0.75,
      next: { label: 'Genin D', at: 8 },
    });
    expect(statTier(15).label).toBe('Chūnin C');
    expect([20, 28].map((v) => statTier(v).label)).toEqual(['Jōnin B', 'Jōnin A']);
    expect(statTier(45)).toMatchObject({ grade: 'S', label: 'Kage S', progress: 1, next: null });
    expect(statTier(1).grade).toBe('E');
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
