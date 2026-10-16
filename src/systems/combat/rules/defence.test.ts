import type { CombatAttributes, CombatTechnique } from '../contract';
import {
  counterChance,
  dodgeChance,
  GUARD_SCALE,
  guardScale,
  resistChance,
  slipChance,
} from './defence';

const BASE: CombatAttributes = {
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

const at = (over: Partial<CombatAttributes> = {}) => ({ attributes: { ...BASE, ...over } });

const illusion: CombatTechnique = {
  id: 'illusion',
  name: 'Illusion',
  discipline: 'genjutsu',
  chakraCost: 4,
  effects: [{ verb: 'damage', power: 10 }],
};
const bolt: CombatTechnique = { ...illusion, id: 'bolt', discipline: 'ninjutsu' };

describe('defence layers', () => {
  it('evasion: speed and perception slip blows', () => {
    const plain = dodgeChance(at(), at());
    expect(dodgeChance(at(), at({ speed: 16 }))).toBeGreaterThan(plain);
    expect(dodgeChance(at(), at({ perception: 16 }))).toBeGreaterThan(plain);
    expect(dodgeChance(at({ speed: 16 }), at())).toBeLessThan(plain);
  });

  it('guard: taijutsu and strength catch more of a blow', () => {
    expect(guardScale(at(), at())).toBeCloseTo(GUARD_SCALE);
    expect(guardScale(at(), at({ taijutsu: 16, strength: 16 }))).toBeLessThan(GUARD_SCALE);
    expect(guardScale(at({ taijutsu: 16, strength: 16 }), at())).toBeGreaterThan(GUARD_SCALE);
    expect(counterChance({ attack: 10, answer: 16 })).toBeGreaterThan(
      counterChance({ attack: 10, answer: 10 }),
    );
  });

  it('resistance: willpower against genjutsu, perception against the rest', () => {
    const willed = at({ willpower: 16 });
    const sharp = at({ perception: 16 });
    expect(resistChance(at(), willed, illusion)).toBeGreaterThan(
      resistChance(at(), sharp, illusion),
    );
    expect(resistChance(at(), sharp, bolt)).toBeGreaterThan(resistChance(at(), willed, bolt));
  });

  it('reads the gap, so equals stand the same at every grade', () => {
    const low = { attributes: { ...BASE, speed: 5, perception: 5 } };
    const high = { attributes: { ...BASE, speed: 30, perception: 30 } };
    expect(dodgeChance(low, low)).toBeCloseTo(dodgeChance(high, high));
  });
});

describe('accuracy', () => {
  it('a sure technique is harder to slip, a wild one easier, and nothing is always slipped', () => {
    const chance = dodgeChance(at(), at());
    expect(slipChance(chance, 'sure')).toBeLessThan(chance);
    expect(slipChance(chance, 'steady')).toBe(chance);
    expect(slipChance(chance, undefined)).toBe(chance);
    expect(slipChance(chance, 'wild')).toBeGreaterThan(chance);
    expect(slipChance(0.9, 'wild')).toBeLessThan(0.9);
  });
});
