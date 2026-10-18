import { bearing } from './compass';

describe('the way one place lies from another', () => {
  it('reads the map with north at the top', () => {
    const here = { x: 50, y: 50 };
    expect(bearing(here, { x: 50, y: 10 })).toBe('north');
    expect(bearing(here, { x: 90, y: 50 })).toBe('east');
    expect(bearing(here, { x: 50, y: 90 })).toBe('south');
    expect(bearing(here, { x: 10, y: 50 })).toBe('west');
    expect(bearing(here, { x: 80, y: 20 })).toBe('north-east');
    expect(bearing(here, { x: 20, y: 80 })).toBe('south-west');
  });
});
