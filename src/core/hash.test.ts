import { hashString, hashUnit } from './hash';

describe('hash', () => {
  it('is stable and spreads values', () => {
    expect(hashString('patrol')).toBe(hashString('patrol'));
    expect(hashString('patrol')).not.toBe(hashString('patrols'));
    const values = Array.from({ length: 200 }, (_, i) => hashUnit(7, i, 'job'));
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
    expect(values.filter((v) => v < 0.5).length).toBeGreaterThan(70);
    expect(values.filter((v) => v < 0.5).length).toBeLessThan(130);
  });
});
