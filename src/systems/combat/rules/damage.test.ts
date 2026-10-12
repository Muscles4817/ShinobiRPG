import type { CombatAttributes, CombatTechnique } from '../contract';
import {
  BLOW_DAMAGE,
  DAMAGE_VARIANCE,
  gapScale,
  healAmount,
  strikeDamage,
  techniqueDamage,
  variance,
} from './damage';

const STATS = [
  'strength',
  'speed',
  'stamina',
  'chakraControl',
  'intellect',
  'perception',
  'willpower',
  'taijutsu',
  'ninjutsu',
  'genjutsu',
  'kenjutsu',
  'fuuinjutsu',
] as const;

function even(value: number, over: Partial<CombatAttributes> = {}) {
  const attributes = Object.fromEntries(STATS.map((id) => [id, value])) as CombatAttributes;
  return { attributes: { ...attributes, ...over } };
}

const fireballTechnique: CombatTechnique = {
  id: 'fireball',
  name: 'Fireball',
  discipline: 'ninjutsu',
  chakraCost: 8,
  effects: [{ verb: 'damage', power: 16 }],
};
const fireball = { technique: fireballTechnique, effect: { verb: 'damage', power: 16 } } as const;
const dread = {
  technique: { ...fireballTechnique, id: 'dread', discipline: 'genjutsu' },
  effect: fireball.effect,
} as const;
const mend = {
  technique: { ...fireballTechnique, id: 'mend', effects: [{ verb: 'heal', power: 18 }] },
  effect: { verb: 'heal', power: 18 },
} as const;

describe('gap damage', () => {
  it('equals trade the same blows at every grade', () => {
    const hits = [5, 10, 16, 24, 33].map((v) => strikeDamage(even(v), even(v), 0.5));
    expect(new Set(hits)).toEqual(new Set([BLOW_DAMAGE]));
  });

  it('the stronger side hits much harder, the weaker much softer', () => {
    const [weak, strong] = [even(10), even(16)];
    expect(strikeDamage(strong, weak, 0.5)).toBeGreaterThan(2 * BLOW_DAMAGE);
    expect(strikeDamage(weak, strong, 0.5)).toBeLessThan(BLOW_DAMAGE / 2);
    expect(gapScale(10, 10)).toBe(1);
  });

  it('stamina is toughness: it softens blows, and no longer adds health', () => {
    const tough = even(10, { stamina: 20 });
    expect(strikeDamage(even(10), tough, 0.5)).toBeLessThan(strikeDamage(even(10), even(10), 0.5));
  });

  it('rolls swing only a little', () => {
    expect(variance(0)).toBeCloseTo(1 - DAMAGE_VARIANCE);
    expect(variance(1)).toBeCloseTo(1 + DAMAGE_VARIANCE);
  });

  it('techniques hit harder than blows, through the defence they meet', () => {
    const [caster, target] = [even(10), even(10)];
    expect(techniqueDamage(caster, target, fireball, 0.5)).toBeGreaterThan(BLOW_DAMAGE);
    const willed = even(10, { willpower: 20 });
    const tough = even(10, { stamina: 20 });
    expect(techniqueDamage(caster, willed, dread, 0.5)).toBeLessThan(
      techniqueDamage(caster, tough, dread, 0.5),
    );
    expect(techniqueDamage(caster, tough, fireball, 0.5)).toBeLessThan(
      techniqueDamage(caster, willed, fireball, 0.5),
    );
  });

  it('healing grows with ninjutsu and chakra control together', () => {
    const medic = even(10, { ninjutsu: 20, chakraControl: 20 });
    expect(healAmount(medic, mend)).toBeGreaterThan(healAmount(even(10), mend));
    expect(healAmount(even(10, { chakraControl: 20 }), mend)).toBeGreaterThan(
      healAmount(even(10), mend),
    );
  });
});
