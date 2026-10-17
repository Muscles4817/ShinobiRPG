import { partnered, TANDEM_BONUS, tandemScale } from './retinue';

interface Fighter {
  readonly id: string;
  readonly master?: string;
  readonly health: number;
  readonly bound?: boolean;
}

const handler: Fighter = { id: 'handler', health: 100 };
const hound: Fighter = { id: 'hound', master: 'handler', health: 60 };
const stranger: Fighter = { id: 'stranger', health: 100 };
const free = (f: Fighter) => !f.bound;

describe('retinues', () => {
  it('links a companion and its master, and no one else', () => {
    expect(partnered(handler, hound)).toBe(true);
    expect(partnered(hound, handler)).toBe(true);
    expect(partnered(handler, stranger)).toBe(false);
    expect(partnered(hound, hound)).toBe(false);
  });

  it('lifts both partners while they stand free together', () => {
    const fighters = [handler, hound, stranger];
    expect(tandemScale(handler, fighters, free)).toBeCloseTo(1 + TANDEM_BONUS);
    expect(tandemScale(hound, fighters, free)).toBeCloseTo(1 + TANDEM_BONUS);
    expect(tandemScale(stranger, fighters, free)).toBe(1);
  });

  it('breaks when one partner is down or bound', () => {
    const fallen = { ...hound, health: 0 };
    expect(tandemScale(handler, [handler, fallen], free)).toBe(1);
    const held = { ...hound, bound: true };
    expect(tandemScale(handler, [handler, held], free)).toBe(1);
    expect(tandemScale(held, [handler, held], free)).toBe(1);
  });
});
