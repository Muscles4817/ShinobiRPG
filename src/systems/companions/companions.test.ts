import { createStats } from '@/systems/stats';

import {
  bondGain,
  ordersOpen,
  ordersStages,
  STRAY_VISITS_NEEDED,
  strayWon,
  visitStray,
  withBond,
  type Companion,
} from './companions';

const pup: Companion = {
  id: 'companion-1',
  kindId: 'hound',
  name: 'Ash',
  stats: createStats(4),
  aptitude: createStats(1),
  bond: 0,
  lastGrownDay: 0,
  health: 60,
  lastFedDay: 0,
  lastPlayDay: null,
  injury: null,
  favouriteKnown: false,
};

describe('companions', () => {
  it('a bred animal bonds faster than a wild one', () => {
    expect(bondGain(10, 'bred')).toBeGreaterThan(bondGain(10, 'stray'));
    expect(bondGain(10, 'wild')).toBeLessThan(bondGain(10, 'stray'));
  });

  it('keeps the bond between none and the top', () => {
    expect(withBond(pup, -5).bond).toBe(0);
    expect(withBond(pup, 500).bond).toBe(100);
  });

  it('takes stance orders before card orders, and a wild one later', () => {
    expect(ordersOpen(0, 'bred')).toEqual({ stance: false, cards: false });
    expect(ordersOpen(10, 'bred')).toEqual({ stance: true, cards: false });
    expect(ordersOpen(30, 'bred')).toEqual({ stance: true, cards: true });
    expect(ordersOpen(10, 'wild')).toEqual({ stance: false, cards: false });
    expect(ordersStages('wild').cards).toBeGreaterThan(ordersStages('bred').cards);
  });

  it('a stray comes home after enough days together, starting over for another', () => {
    let friendship = visitStray(null, 'hound', 1);
    for (let day = 2; day <= STRAY_VISITS_NEEDED; day++) {
      expect(strayWon(friendship)).toBe(false);
      friendship = visitStray(friendship, 'hound', day);
    }
    expect(strayWon(friendship)).toBe(true);
    expect(visitStray(friendship, 'cat', 9).visits).toBe(1);
  });
});
