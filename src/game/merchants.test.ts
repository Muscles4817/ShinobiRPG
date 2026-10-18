import { ctx, newGame } from '@/test/gameFixtures';

import { daysUntilVisit, visitingOn } from './merchants';
import type { GameState } from './state';
import { marketView } from './views/market';

const CART = { visits: { every: 7, on: 2 } };

function onDay(day: number): GameState {
  const state = newGame();
  return { ...state, time: { day, slot: 0 }, board: { ...state.board, refreshedDay: day } };
}

describe('travelling merchants', () => {
  it('come on their day of the cycle, and say when they are next due', () => {
    expect(visitingOn(CART, 3)).toBe(true);
    expect(visitingOn(CART, 10)).toBe(true);
    expect(visitingOn(CART, 4)).toBe(false);
    expect(visitingOn({}, 4)).toBe(true);
    expect(daysUntilVisit(CART, 3)).toBe(0);
    expect(daysUntilVisit(CART, 4)).toBe(6);
    expect(daysUntilVisit(CART, 1)).toBe(2);
    expect(daysUntilVisit({}, 1)).toBeNull();
  });

  it('set up on Market Street only on their days, and the market says who is coming', () => {
    const names = (day: number) => marketView(onDay(day), ctx)?.stalls.map((s) => s.name) ?? [];
    expect(names(3)).toContain('The Shiomachi Fish Cart');
    expect(names(4)).not.toContain('The Shiomachi Fish Cart');
    expect(marketView(onDay(1), ctx)?.coming[0]).toBe('The Shiomachi Fish Cart comes in two days.');
    const cart = marketView(onDay(3), ctx)?.stalls.find(
      (s) => s.name === 'The Shiomachi Fish Cart',
    );
    expect(cart?.cookbooks.map((b) => b.id)).toEqual(['recipes-from-the-port']);
  });
});
