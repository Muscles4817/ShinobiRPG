import type { CombatDust, DustKind } from '../dustContract';
import { shieldBlock, shieldHolds, shieldMeets, shieldRises, SHIELD_MIN_DUST } from './shield';

const SAND: DustKind = {
  name: 'Sand',
  qualities: { weight: 2, hold: 4, draw: 5 },
  gifts: {},
  banes: ['water'],
  drawnOn: ['arena'],
};
const GOLD: DustKind = { ...SAND, name: 'Gold Dust', qualities: { weight: 5, hold: 5, draw: 1 } };

function store(kind: DustKind, count = 200): CombatDust {
  return { kind, count, cap: 200 };
}

describe('the automatic shield', () => {
  it('rises slower the heavier its dust', () => {
    expect(shieldRises(store(GOLD), 18)).toBeLessThan(shieldRises(store(SAND), 18));
  });

  it('rises against the slow almost always, and is outrun by real speed', () => {
    const slow = shieldRises(store(SAND), 10);
    expect(slow).toBeGreaterThan(0.8);
    expect(shieldRises(store(SAND), 30)).toBeLessThan(slow);
    expect(shieldRises(store(SAND), 60)).toBe(0);
  });

  it('cannot rise without enough dust to hand', () => {
    expect(shieldRises(store(SAND, SHIELD_MIN_DUST - 1), 5)).toBe(0);
  });

  it('never meets an illusion', () => {
    expect(shieldMeets('mind')).toBe(false);
    expect(shieldMeets('blunt')).toBe(true);
  });

  it('keeps out what it holds, heavier dust more, a break half as much', () => {
    expect(shieldHolds(GOLD, false)).toBeGreaterThan(shieldHolds(SAND, false));
    expect(shieldHolds(SAND, true)).toBeCloseTo(shieldHolds(SAND, false) / 2);
  });

  it('takes a small hit whole and lets a big one through with what is left', () => {
    expect(shieldBlock(store(SAND), 5, false)).toEqual({ kept: 5, cost: 5 });
    const big = shieldBlock(store(SAND), 80, false);
    expect(big.kept).toBeLessThan(80);
    expect(big.kept).toBe(Math.round(shieldHolds(SAND, false)));
  });

  it('keeps out only what its dust pays for', () => {
    expect(shieldBlock(store(SAND, 12), 20, false)).toEqual({ kept: 12, cost: 12 });
  });
});
