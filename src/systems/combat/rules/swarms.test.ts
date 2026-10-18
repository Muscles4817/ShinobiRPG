import type { CombatSwarm } from '../swarmContract';
import {
  areaLoss,
  burnsOff,
  fearedLoss,
  hiveWord,
  settleDrain,
  spentFrom,
  swarmAffords,
  swarmSearch,
} from './swarms';

const hive: CombatSwarm = {
  strain: { name: 'drainers', drain: 1, hardiness: 0, fears: ['fire'], senses: 0.5 },
  count: 100,
  cap: 100,
};
const hardy = { ...hive, strain: { ...hive.strain, hardiness: 0.5 } };

describe('swarm rules', () => {
  it('spends insects a fighter has; a fighter without a hive pays chakra alone', () => {
    expect(swarmAffords(undefined, 20)).toBe(true);
    expect(swarmAffords(hive, 20)).toBe(true);
    expect(swarmAffords({ ...hive, count: 10 }, 20)).toBe(false);
    expect(spentFrom(hive, 20).count).toBe(80);
  });

  it('an area kills more the wider it is, twice as many when the strain fears it', () => {
    expect(areaLoss(hive, 'wide')).toBeGreaterThan(areaLoss(hive, 'small'));
    expect(areaLoss(hive, 'wide', 'fire')).toBe(2 * areaLoss(hive, 'wide'));
    expect(areaLoss(hardy, 'wide')).toBeLessThan(areaLoss(hive, 'wide'));
  });

  it('only a feared element kills insects as it hurts their host, and never all at once', () => {
    expect(fearedLoss(hive, 30, 'water')).toBe(0);
    expect(fearedLoss(hive, 30, 'fire')).toBeGreaterThan(0);
    expect(fearedLoss(hive, 100, 'fire')).toBeLessThanOrEqual(50);
    expect(burnsOff(hive, 'fire')).toBe(true);
    expect(burnsOff(hive, undefined)).toBe(false);
  });

  it('a stronger technique settles a heavier drain; a fuller hive senses better', () => {
    expect(settleDrain(hive, 20)).toBeGreaterThan(settleDrain(hive, 10));
    expect(swarmSearch(hive)).toBeGreaterThan(swarmSearch({ ...hive, count: 20 }));
    expect(swarmSearch(undefined)).toBe(0);
  });

  it('reads a hive in a word', () => {
    expect(hiveWord(hive)).toBe('thick');
    expect(hiveWord({ ...hive, count: 20 })).toBe('thin');
    expect(hiveWord({ ...hive, count: 0 })).toBe('spent');
  });
});
