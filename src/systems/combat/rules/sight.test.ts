import { sightRead, travelsBy, TRAVEL_READ, UNSEEN_READ } from './sight';

/** What a defender can see of an attack: unseen is read worse, travelling better further off. */

describe('sight of an attack', () => {
  it('reads an attack from someone unseen far worse', () => {
    expect(sightRead({ unseen: true, travels: false, band: 'close' })).toBe(UNSEEN_READ);
  });

  it('reads a travelling attack better the further it comes, and a blow not at all', () => {
    expect(sightRead({ unseen: false, travels: true, band: 'far' })).toBe(TRAVEL_READ.far);
    expect(sightRead({ unseen: false, travels: true, band: 'close' })).toBe(1);
    expect(travelsBy('thrown')).toBe(true);
    expect(travelsBy('strike')).toBe(false);
  });
});
