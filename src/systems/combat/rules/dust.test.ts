import type { CombatDust, DustKind } from '../dustContract';
import {
  dustAffords,
  dustGuardScale,
  dustPowerScale,
  dustSlipScale,
  dustUsed,
  dustWord,
  HEAVY_HIT,
  scattered,
} from './dust';

/** The rules of commanded dust: spending and drawing, weight, guarding and banes. */

const SAND: DustKind = {
  name: 'sand',
  qualities: { weight: 2, hold: 3, draw: 4 },
  gifts: {},
  banes: ['water'],
  drawnOn: ['arena', 'forest', 'town'],
};
const GLASS: DustKind = { ...SAND, name: 'glass', banes: ['heavy'], drawnOn: [] };
const pool = (kind: DustKind = SAND, count = 100): CombatDust => ({ kind, count, cap: 100 });

describe('dust rules', () => {
  it('a fighter without dust affords anything; with dust only what they command', () => {
    expect(dustAffords(undefined, 30)).toBe(true);
    expect(dustAffords(pool(SAND, 20), 30)).toBe(false);
  });

  it('a draw pulls up more on ground that holds the dust, never past the cap', () => {
    const thin = pool(SAND, 40);
    const onSand = dustUsed(thin, { draw: 30, ground: 'arena' }).count;
    const onLake = dustUsed(thin, { draw: 30, ground: 'lake' }).count;
    expect(onSand).toBeGreaterThan(onLake);
    expect(onLake).toBeGreaterThan(40);
    expect(dustUsed(pool(), { draw: 30, ground: 'arena' }).count).toBe(100);
    expect(dustUsed(pool(), { cost: 25, ground: 'arena' }).count).toBe(75);
  });

  it('heavy dust hits harder and arrives slower, and helps a Guard more', () => {
    const iron = { ...SAND, qualities: { ...SAND.qualities, weight: 5 } };
    expect(dustPowerScale(iron)).toBeGreaterThan(dustPowerScale(SAND));
    expect(dustSlipScale(iron)).toBeGreaterThan(dustSlipScale(SAND));
    expect(dustGuardScale(pool(iron))).toBeLessThan(dustGuardScale(pool(SAND)));
    expect(dustGuardScale(pool(SAND, 5))).toBe(1);
    expect(dustGuardScale(undefined)).toBe(1);
  });

  it('a bane scatters dust: an element for sand, a heavy blow for glass', () => {
    expect(scattered(pool(), { damage: 20, element: 'water', physical: false })).toBeGreaterThan(0);
    expect(scattered(pool(), { damage: 20, element: 'fire', physical: false })).toBe(0);
    expect(scattered(pool(GLASS), { damage: HEAVY_HIT, physical: true })).toBeGreaterThan(0);
    expect(scattered(pool(GLASS), { damage: HEAVY_HIT - 1, physical: true })).toBe(0);
  });

  it('reads dust in a word', () => {
    expect(dustWord(pool())).toBe('thick');
    expect(dustWord(pool(SAND, 10))).toBe('thin');
    expect(dustWord(pool(SAND, 0))).toBe('spent');
  });
});
