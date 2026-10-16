import type { CombatAttributes, CombatTechnique } from '../contract';
import { escapeScale, holdsOnly } from './catching';

const line = (intellect: number, speed: number): { attributes: CombatAttributes } => ({
  attributes: {
    strength: 20,
    speed,
    stamina: 20,
    chakraControl: 20,
    intellect,
    perception: 20,
    willpower: 20,
    taijutsu: 20,
    ninjutsu: 20,
    genjutsu: 20,
    kenjutsu: 20,
    fuuinjutsu: 20,
  },
});

const technique = (verb: 'pin' | 'damage'): CombatTechnique => ({
  id: verb,
  name: verb,
  discipline: 'ninjutsu',
  effects: [{ verb, power: 10 }],
  chakraCost: 5,
});

describe('catching someone in a hold', () => {
  it('only a technique that holds without wounding is a hold', () => {
    expect(holdsOnly(technique('pin'))).toBe(true);
    expect(holdsOnly(technique('damage'))).toBe(false);
  });

  it('is slipped more by a target sharper and quicker than the caster, wits counting most', () => {
    expect(escapeScale(line(20, 20), line(20, 20))).toBe(1);
    expect(escapeScale(line(20, 20), line(40, 20))).toBeGreaterThan(
      escapeScale(line(20, 20), line(20, 40)),
    );
    expect(escapeScale(line(40, 40), line(10, 10))).toBeLessThan(1);
  });
});
