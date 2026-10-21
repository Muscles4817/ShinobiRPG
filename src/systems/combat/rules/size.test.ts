import type { CombatAttributes } from '../contract';
import { toughness } from './damage';
import {
  reachesWithFists,
  sizeGap,
  sizeHealthScale,
  sizeOf,
  sizeSlips,
  walksThrough,
} from './size';
import { strikeReach } from './weaponClasses';

const attributes: CombatAttributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

describe('size', () => {
  it('a big body has more health, takes a blow better and is a bigger target', () => {
    expect(sizeHealthScale('large')).toBeGreaterThan(1);
    expect(sizeHealthScale(undefined)).toBe(1);
    expect(toughness({ attributes, size: 'large' })).toBeGreaterThan(toughness({ attributes }));
    expect(sizeSlips({ size: 'large' })).toBeLessThan(sizeSlips({}));
  });

  it('a technique grows a body while it holds, never past huge', () => {
    expect(sizeOf({ size: 'large', empowered: { grows: 1 } })).toBe('huge');
    expect(sizeOf({ size: 'large', empowered: { grows: 2 } })).toBe('huge');
    expect(sizeOf({ empowered: { grows: 1 } })).toBe('large');
    expect(sizeGap({ size: 'huge' }, {})).toBe(2);
  });

  it('walks through a shot that would stop a human, unless it hurt too much', () => {
    expect(walksThrough({ size: 'large' }, 10, 130)).toBe(true);
    expect(walksThrough({ size: 'large' }, 60, 130)).toBe(false);
    expect(walksThrough({}, 5, 100)).toBe(false);
  });

  it('a body grown huge reaches past arm’s length with its fists', () => {
    expect(reachesWithFists({ size: 'large', empowered: { grows: 1 } })).toBe(true);
    expect(strikeReach({ size: 'huge' })).toContain('mid');
    expect(strikeReach({ size: 'large' })).toEqual(['close']);
  });
});
