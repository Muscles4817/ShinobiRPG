import { FAMILIAR_MAX, familiarScale, repeatWeight } from './familiarity';

describe('familiarity', () => {
  it('gives nothing away in the first uses, then reads a technique more each time, up to a point', () => {
    expect(familiarScale(0)).toBe(1);
    expect(familiarScale(1)).toBe(1);
    expect(familiarScale(2)).toBeGreaterThan(1);
    expect(familiarScale(3)).toBeGreaterThan(familiarScale(2));
    expect(familiarScale(50)).toBe(FAMILIAR_MAX);
  });

  it('leans less on a card played turns running, never to nothing', () => {
    expect(repeatWeight(0)).toBe(1);
    expect(repeatWeight(2)).toBeLessThan(repeatWeight(1));
    expect(repeatWeight(30)).toBeGreaterThan(0);
  });
});
