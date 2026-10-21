import {
  footingOf,
  groundElementScale,
  groundMiss,
  GROUND_RULES,
  sureFooted,
  withinGround,
} from './ground';

const walker = { perks: ['water-walking' as const, 'tree-walking' as const] };
const nobody = { perks: [] };

describe('grounds', () => {
  it('an arena changes nothing', () => {
    expect(footingOf('arena', nobody)).toBe(1);
    expect(groundMiss('arena', nobody, 'far')).toBe(0);
    expect(groundElementScale('arena', 'fire')).toBe(1);
    expect(withinGround(undefined, 'far')).toBe('far');
  });

  it('on a lake only water-walkers keep their footing, and water runs strong', () => {
    expect(sureFooted('lake', walker)).toBe(true);
    expect(footingOf('lake', walker)).toBe(1);
    expect(footingOf('lake', nobody)).toBe(GROUND_RULES.lake.footing);
    expect(groundElementScale('lake', 'water')).toBeGreaterThan(1);
  });

  it('among trees, far attacks go wide unless you walk up them, and fire catches', () => {
    expect(groundMiss('forest', nobody, 'far')).toBeGreaterThan(0);
    expect(groundMiss('forest', nobody, 'mid')).toBe(0);
    expect(groundMiss('forest', walker, 'far')).toBe(0);
    expect(groundElementScale('forest', 'fire')).toBeGreaterThan(1);
  });

  it('in the desert the haze throws off every far shot, and wind and fire run strong', () => {
    expect(groundMiss('desert', walker, 'far')).toBeGreaterThan(0);
    expect(groundMiss('desert', nobody, 'far')).toBe(groundMiss('desert', walker, 'far'));
    expect(groundMiss('desert', nobody, 'mid')).toBe(0);
    expect(footingOf('desert', nobody)).toBe(1);
    expect(groundElementScale('desert', 'wind')).toBeGreaterThan(1);
    expect(groundElementScale('desert', 'fire')).toBeGreaterThan(1);
    expect(groundElementScale('desert', 'water')).toBeLessThan(1);
  });

  it('a room has no far range', () => {
    expect(withinGround('room', 'far')).toBe('mid');
    expect(withinGround('room', 'close')).toBe('close');
  });
});
