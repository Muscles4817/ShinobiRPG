import type { CombatAttributes, CombatTechnique } from '../contract';
import {
  bestArt,
  BLOW_DAMAGE,
  cappedHit,
  MAX_HIT_SHARE,
  SKILL_DEFENCE_SHARE,
  physicalDefence,
  toughness,
  DAMAGE_VARIANCE,
  gapScale,
  healAmount,
  strikeDamage,
  techniqueDamage,
  variance,
  WILD_DAMAGE,
} from './damage';
import { reachOf } from './range';

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

  it('a wild technique hits harder when it lands', () => {
    const [caster, target] = [even(10), even(10)];
    const wild = { ...fireball, technique: { ...fireballTechnique, accuracy: 'wild' } } as const;
    expect(
      techniqueDamage(caster, target, wild, 0.5) / techniqueDamage(caster, target, fireball, 0.5),
    ).toBeCloseTo(WILD_DAMAGE, 1);
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

describe('skill in defence', () => {
  it('a trained fighter’s best art defends them alongside stamina', () => {
    const specialist = even(5, { ninjutsu: 9 });
    expect(bestArt(specialist)).toBe(9);
    expect(toughness(specialist)).toBeCloseTo(
      5 * (1 - SKILL_DEFENCE_SHARE) + 9 * SKILL_DEFENCE_SHARE,
    );
  });

  it('so between specialists of the same grade, a technique lands a few blows’ worth, not a kill', () => {
    const caster = even(5, { ninjutsu: 9 });
    const brawler = even(5, { taijutsu: 9, strength: 6 });
    const hit = techniqueDamage(caster, brawler, fireball, 0.5);
    expect(hit).toBeLessThan(40);
    expect(hit).toBeGreaterThan(15);
  });

  it('no hit takes more than half the target’s health', () => {
    expect(cappedHit(200, 100)).toBe(100 * MAX_HIT_SHARE);
    expect(cappedHit(20, 100)).toBe(20);
    expect(cappedHit(200, 50)).toBe(50 * MAX_HIT_SHARE);
  });
});

describe('guard against blows', () => {
  // A seal scholar: toughness from their art, little hand-to-hand.
  const scholar = even(10, { fuuinjutsu: 20, taijutsu: 5, strength: 5 });
  // As tough, but a brawler's hands and frame.
  const brawler = even(10, { fuuinjutsu: 20, taijutsu: 20, strength: 20 });

  it('hand-to-hand skill and strength catch a blow better than toughness alone', () => {
    expect(physicalDefence(brawler)).toBeGreaterThan(toughness(brawler));
    expect(strikeDamage(even(15), brawler, 0.5)).toBeLessThan(strikeDamage(even(15), scholar, 0.5));
  });

  it('never leaves anyone worse off against a blow than their toughness', () => {
    expect(physicalDefence(scholar)).toBe(toughness(scholar));
  });

  it('counts against physical arts only', () => {
    const palm: CombatTechnique = { ...fireballTechnique, id: 'palm', discipline: 'taijutsu' };
    const hit = (t: CombatTechnique, target: ReturnType<typeof even>) =>
      techniqueDamage(
        even(15),
        target,
        { technique: t, effect: { verb: 'damage', power: 10 } },
        0.5,
      );
    expect(hit(palm, brawler)).toBeLessThan(hit(palm, scholar));
    expect(hit(fireballTechnique, brawler)).toBe(hit(fireballTechnique, scholar));
  });
});

describe('reach', () => {
  it('a technique’s own reach overrides its art’s', () => {
    expect(reachOf(fireballTechnique)).toEqual(['mid', 'far']);
    expect(reachOf({ ...fireballTechnique, reach: ['far'] })).toEqual(['far']);
  });
});
