import type { CombatAttributes, CombatTechnique } from '../contract';
import { canCopy, foreseen, MAX_COPIES } from './eyes';

const attributes = (ninjutsu: number): CombatAttributes => ({
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
});

const bullet: CombatTechnique = {
  id: 'bullet',
  name: 'Bullet',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 16 }],
  chakraCost: 10,
};

const copier = {
  perks: ['insight', 'mimicry'] as const,
  attributes: attributes(30),
  techniques: [],
};
const user = { attributes: attributes(40) };

describe('eyes', () => {
  it('foresight makes a chance likelier, never past its ceiling; without it nothing changes', () => {
    const scale = { scale: 1.5, ceiling: 0.7 };
    expect(foreseen(0.4, { perks: ['foresight'] }, scale)).toBeCloseTo(0.6);
    expect(foreseen(0.6, { perks: ['foresight'] }, scale)).toBe(0.7);
    expect(foreseen(0.4, { perks: ['insight'] }, scale)).toBe(0.4);
  });

  it('mimicry copies a technique its own art could carry', () => {
    expect(canCopy(copier, user, bullet)).toBe(true);
    expect(canCopy({ ...copier, attributes: attributes(20) }, user, bullet)).toBe(false);
    expect(canCopy({ ...copier, perks: ['insight'] }, user, bullet)).toBe(false);
  });

  it('never copies a clan art, a trump, a nature it lacks, one it knows, or past the limit', () => {
    expect(canCopy(copier, user, { ...bullet, clan: 'hyuga' })).toBe(false);
    expect(canCopy(copier, user, { ...bullet, oncePerFight: true })).toBe(false);
    expect(canCopy(copier, user, { ...bullet, needs: { nature: 'fire' } })).toBe(false);
    expect(
      canCopy({ ...copier, nature: 'fire' }, user, { ...bullet, needs: { nature: 'fire' } }),
    ).toBe(true);
    expect(canCopy({ ...copier, techniques: [bullet] }, user, bullet)).toBe(false);
    const full = { ...copier, copied: Array.from({ length: MAX_COPIES }, (_, i) => `t${i}`) };
    expect(canCopy(full, user, bullet)).toBe(false);
  });
});
