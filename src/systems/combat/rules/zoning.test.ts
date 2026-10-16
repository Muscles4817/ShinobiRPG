import { HOLD_OFF_BASE, holdOffChance, holdOffReason } from './zoning';

describe('holding a foe off', () => {
  it('between equals, a single attack holds them off a little under half the time', () => {
    expect(holdOffChance(10, 10)).toBeCloseTo(HOLD_OFF_BASE);
  });

  it('better aim holds a slower foe off more often; a much quicker one slips through', () => {
    expect(holdOffChance(20, 10)).toBeGreaterThan(holdOffChance(10, 10));
    expect(holdOffChance(5, 40)).toBeLessThan(0.15);
  });

  it('an area is harder to get through, and nobody gets through a vast one', () => {
    expect(holdOffChance(10, 10, 'wide')).toBeGreaterThan(holdOffChance(10, 10, 'small'));
    expect(holdOffChance(5, 60, 'vast')).toBe(1);
  });

  it('short of a vast area there is always a gap, however outmatched the closer', () => {
    expect(holdOffChance(60, 5, 'wide')).toBeLessThan(1);
    expect(holdOffChance(60, 5)).toBeLessThan(1);
  });

  it('says why it worked: the area, the aim, or the timing', () => {
    expect(holdOffReason(10, 30, 'wide')).toBe('wide');
    expect(holdOffReason(10, 30, 'vast')).toBe('vast');
    expect(holdOffReason(30, 10)).toBe('aim');
    expect(holdOffReason(10, 30, 'small')).toBe('timing');
  });
});
