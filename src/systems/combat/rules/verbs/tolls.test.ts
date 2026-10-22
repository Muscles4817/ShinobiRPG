import { spentBody, stepBreathPrice, stepHealthPrice, stepToll } from './tolls';

const gate = (step: number) => ({ ladder: 'gates' as const, step });

describe('a ladder step’s toll', () => {
  it('costs more the deeper it goes, in wind and then in health', () => {
    const breath = [1, 3, 6, 7].map((s) => stepBreathPrice(gate(s), 100));
    expect(breath).toEqual([...breath].sort((a, b) => a - b));
    expect(stepHealthPrice(gate(3), 100)).toBe(0);
    expect(stepHealthPrice(gate(5), 100)).toBeGreaterThan(0);
    expect(stepHealthPrice(gate(6), 100)).toBeGreaterThan(stepHealthPrice(gate(5), 100));
  });

  it('leaves about a round at the seventh gate before the body gives out', () => {
    const exchanges = 90 / stepHealthPrice(gate(7), 100);
    expect(exchanges).toBeGreaterThanOrEqual(3);
    expect(exchanges).toBeLessThanOrEqual(5);
    expect(stepToll(gate(7)).collapses).toBe(true);
    expect(stepToll(gate(6)).collapses).toBe(false);
  });

  it('spends the body once it shuts: wind from the first gates, speed and strength past the third', () => {
    const body = { stamina: 30, speed: 30, strength: 30, taijutsu: 30 };
    const third = spentBody(body, gate(3));
    expect(third.stamina).toBeLessThan(30);
    expect(third.speed).toBe(30);
    const sixth = spentBody(body, gate(6));
    expect(sixth.speed).toBeLessThan(30);
    expect(sixth.strength).toBeLessThan(30);
    expect(sixth.stamina).toBeLessThan(third.stamina);
    expect(sixth.taijutsu).toBe(30);
  });
});
