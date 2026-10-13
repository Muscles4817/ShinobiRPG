import type { CombatAttributes, CombatTechnique } from '../../contract';
import {
  afflicted,
  afflictionFrom,
  afflictionsTick,
  AFFLICT_EXCHANGES,
  drainAmount,
  MAX_BLEEDS,
  poisonSap,
  withSap,
  type Affliction,
} from './lingering';

const even = (value: number, over: Partial<CombatAttributes> = {}) => ({
  attributes: {
    strength: value,
    speed: value,
    stamina: value,
    chakraControl: value,
    intellect: value,
    perception: value,
    willpower: value,
    taijutsu: value,
    ninjutsu: value,
    genjutsu: value,
    kenjutsu: value,
    fuuinjutsu: value,
    ...over,
  },
});

const needle: CombatTechnique = {
  id: 'needle',
  name: 'Needle',
  discipline: 'taijutsu',
  effects: [{ verb: 'afflict', power: 10, harm: 'poison' }],
  chakraCost: 2,
};
const burn = (perExchange: number): Affliction => ({
  harm: 'burn',
  perExchange,
  exchanges: AFFLICT_EXCHANGES,
});
const bleed = (perExchange: number): Affliction => ({ ...burn(perExchange), harm: 'bleed' });

describe('lingering rules', () => {
  it('a harm bites harder from the skilled, and stamina softens it', () => {
    const use = {
      technique: needle,
      effect: { verb: 'afflict', power: 10, harm: 'poison' },
    } as const;
    const equal = afflictionFrom(even(10), even(10), use).perExchange;
    expect(afflictionFrom(even(10, { taijutsu: 20 }), even(10), use).perExchange).toBeGreaterThan(
      equal,
    );
    expect(afflictionFrom(even(10), even(10, { stamina: 20 }), use).perExchange).toBeLessThan(
      equal,
    );
  });

  it('bleeds stack up to a limit; a burn refreshes and keeps the stronger', () => {
    let list: Affliction[] = [];
    for (let n = 1; n <= MAX_BLEEDS + 1; n++) list = afflicted(list, bleed(n));
    expect(list).toHaveLength(MAX_BLEEDS);
    expect(list.map((a) => a.perExchange)).toEqual([2, 3, 4]);
    const burning = afflicted(afflicted([], burn(5)), burn(3));
    expect(burning).toEqual([burn(5)]);
  });

  it('harms tick down and add up', () => {
    const { harm, left } = afflictionsTick([burn(4), { ...bleed(2), exchanges: 1 }]);
    expect(harm).toBe(6);
    expect(left).toEqual([{ ...burn(4), exchanges: AFFLICT_EXCHANGES - 1 }]);
  });

  it('a poison saps strength and speed and gives them back', () => {
    const body = even(20).attributes;
    const sap = poisonSap(body);
    expect(withSap(body, sap, -1).speed).toBeLessThan(20);
    expect(withSap(withSap(body, sap, -1), sap, 1)).toEqual(body);
  });

  it('a drain draws more from a weaker chakra control', () => {
    const use = {
      technique: { ...needle, effects: [{ verb: 'drain', power: 10 }] },
      effect: { verb: 'drain', power: 10 },
    } as const;
    expect(drainAmount(even(10), even(10), use)).toBe(10);
    expect(drainAmount(even(10), even(10, { chakraControl: 2 }), use)).toBeGreaterThan(10);
  });
});
