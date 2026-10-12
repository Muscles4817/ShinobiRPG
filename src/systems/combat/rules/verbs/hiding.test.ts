import type { CombatTechnique } from '../../contract';
import { searchChance } from '../conditions';
import { concealmentFrom, concealmentOf, senseChance } from '.';

const veil: CombatTechnique = {
  id: 'veil',
  name: 'Veil',
  discipline: 'genjutsu',
  effects: [{ verb: 'conceal', power: 10 }],
  chakraCost: 6,
};
const reach: CombatTechnique = {
  id: 'reach',
  name: 'Reach',
  discipline: 'ninjutsu',
  effects: [{ verb: 'sense', power: 10 }],
  chakraCost: 6,
};
const concealUse = { technique: veil, effect: { verb: 'conceal' as const, power: 10 } };
const senseUse = { technique: reach, effect: { verb: 'sense' as const, power: 10 } };

const stats = (value: number) => ({
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
});

describe('conceal and sense', () => {
  it('a fighter hides with their genjutsu until a conceal sets how well', () => {
    expect(concealmentOf({ attributes: stats(8) })).toBe(8);
    expect(concealmentOf({ attributes: stats(8), concealment: 15 })).toBe(15);
  });

  it('a conceal hides better the stronger its user and the technique', () => {
    expect(concealmentFrom(10, concealUse)).toBeGreaterThan(10);
    expect(concealmentFrom(20, concealUse)).toBeGreaterThan(concealmentFrom(10, concealUse));
  });

  it('a Search is perception against concealment', () => {
    const seeker = { attributes: stats(10), perks: [] };
    const plain = { attributes: stats(10), traits: [] };
    const deep = { ...plain, concealment: 20 };
    expect(searchChance(seeker, deep)).toBeLessThan(searchChance(seeker, plain));
    const sharp = { attributes: { ...stats(10), perception: 30 }, perks: [] };
    expect(searchChance(sharp, deep)).toBeGreaterThan(searchChance(seeker, deep));
  });

  it('a sense finds most hiders, and a far stronger one always', () => {
    const hider = { attributes: stats(10) };
    expect(senseChance(10, senseUse, hider)).toBeGreaterThan(0.75);
    expect(senseChance(30, senseUse, hider)).toBe(1);
    expect(senseChance(2, senseUse, { ...hider, concealment: 30 })).toBe(0.4);
  });
});
