import { createStats } from './stats';
import { fightingPower, statTier } from './tiers';

describe('stat tiers', () => {
  it('names what a value means and what the next step is', () => {
    expect(statTier(5)).toEqual({
      label: 'Academy level',
      next: { label: 'Genin level', at: 7 },
    });
    expect(statTier(12).label).toBe('Seasoned genin');
    expect(statTier(40)).toEqual({ label: 'Kage level', next: null });
    expect(statTier(1).label).toBe('Untrained');
  });

  it('a specialist fights above their all-round level', () => {
    const allRound = createStats(6);
    const specialist = createStats(6, { taijutsu: 6 });
    expect(fightingPower(allRound)).toBe(6);
    expect(fightingPower(specialist)).toBe(9);
  });
});
