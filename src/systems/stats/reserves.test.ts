import { RESERVES_PER_STAMINA, reservesFromChakraSpent, withReserves } from './reserves';
import { applyTraining, createStats } from './stats';

const stats = createStats(5);

describe('chakra reserves', () => {
  it('grow alongside stamina, by a share of the session', () => {
    expect(withReserves({ stamina: 2, willpower: 1 })).toEqual({
      stamina: 2,
      willpower: 1,
      reserves: 2 * RESERVES_PER_STAMINA,
    });
    const after = applyTraining(stats, { stamina: 1.5 });
    expect(after.reserves).toBeGreaterThan(stats.reserves);
    expect(after.reserves - stats.reserves).toBeLessThan(after.stamina - stats.stamina);
  });

  it('do not grow from work that leaves stamina alone', () => {
    expect(applyTraining(stats, { speed: 1.5, taijutsu: 1 }).reserves).toBe(stats.reserves);
    expect(withReserves({ stamina: -1 })).toEqual({ stamina: -1 });
  });

  it('follow their own growth multiplier', () => {
    const stalled = applyTraining(stats, { stamina: 1.5 }, { reserves: 0 });
    expect(stalled.reserves).toBe(stats.reserves);
  });

  it('deepen with the chakra spent in a fight, less as they get deep', () => {
    expect(reservesFromChakraSpent(0)).toEqual({});
    const gains = reservesFromChakraSpent(40);
    const shallow = applyTraining(stats, gains);
    const deep = applyTraining({ ...stats, reserves: 30 }, gains);
    expect(shallow.reserves).toBeGreaterThan(stats.reserves);
    expect(deep.reserves - 30).toBeLessThan(shallow.reserves - stats.reserves);
  });
});
