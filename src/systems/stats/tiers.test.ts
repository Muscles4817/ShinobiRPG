import { createStats } from './stats';
import { fightingPower, statTier } from './tiers';

describe('stat tiers', () => {
  it('grades a value E–S with its shinobi rank, and names the next step', () => {
    expect(statTier(6)).toEqual({
      grade: 'E',
      rank: 'Genin',
      label: 'E · Genin',
      progress: 0.75,
      next: { label: 'D · Genin', at: 8 },
    });
    expect(statTier(15).label).toBe('C · Chūnin');
    expect([20, 28].map((v) => statTier(v).label)).toEqual(['B · Jōnin', 'A · Jōnin']);
    expect(statTier(45)).toMatchObject({ grade: 'S', label: 'S · Kage', progress: 1, next: null });
    expect(statTier(1).grade).toBe('E');
  });

  it('a specialist fights above their all-round level', () => {
    const allRound = createStats(6);
    const specialist = createStats(6, { taijutsu: 6 });
    expect(fightingPower(allRound)).toBe(6);
    expect(fightingPower(specialist)).toBe(9);
  });
});
