import { afterFight, bredFor, chakraKept, hiveCap, type Hive } from './hives';

const hive: Hive = { strainId: 'kikaichu', share: 'half', count: 10 };

describe('hives', () => {
  it('a bigger share keeps more insects and leaves the host less chakra', () => {
    expect(hiveCap(100, 'most')).toBeGreaterThan(hiveCap(100, 'little'));
    expect(chakraKept(100, 'most')).toBeLessThan(chakraKept(100, 'little'));
    expect(chakraKept(100, 'half') + hiveCap(100, 'half') / 2).toBe(100);
  });

  it('breeds back faster at home than away, slower when hungry, never past the cap', () => {
    const home = bredFor(hive, 80, { atHome: true, hungry: false }).count;
    const away = bredFor(hive, 80, { atHome: false, hungry: false }).count;
    const hungry = bredFor(hive, 80, { atHome: true, hungry: true }).count;
    expect(home).toBeGreaterThan(away);
    expect(home).toBeGreaterThan(hungry);
    expect(bredFor({ ...hive, count: 79 }, 80, { atHome: true, hungry: false }).count).toBe(80);
  });

  it('keeps what came home from a fight', () => {
    expect(afterFight(hive, 4, 80).count).toBe(4);
    expect(afterFight(hive, 200, 80).count).toBe(80);
  });
});
