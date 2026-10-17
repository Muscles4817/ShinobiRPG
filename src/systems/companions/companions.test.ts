import { createStats } from '@/systems/stats';

import {
  bondGain,
  ordersOpen,
  ordersStages,
  daysToWin,
  limitShift,
  lostTrail,
  visitStray,
  wonOver,
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
    for (let day = 2; day <= daysToWin('stray'); day++) {
      expect(wonOver(friendship, 'stray')).toBe(false);
      friendship = visitStray(friendship, 'hound', day);
    }
    expect(wonOver(friendship, 'stray')).toBe(true);
    expect(visitStray(friendship, 'cat', 9).visits).toBe(1);
  });

  it('a wild one takes longer to win, and a day it slips you counts for nothing', () => {
    expect(daysToWin('wild')).toBeGreaterThan(daysToWin('stray'));
    const tracked = visitStray(null, 'wolf', 1);
    expect(lostTrail(tracked, 'wolf', 2)).toEqual({ kindId: 'wolf', visits: 1, lastVisitDay: 2 });
    expect(lostTrail(tracked, 'bear', 2).visits).toBe(0);
  });

  it('a wild one grows furthest past its talent, a stray least', () => {
    expect(limitShift('wild')).toBeGreaterThan(limitShift('bred'));
    expect(limitShift('stray')).toBeLessThan(limitShift('bred'));
  });
});
