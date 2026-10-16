import type { CombatAttributes, CombatTechnique } from '../contract';
import type { ArmourLevel, CombatGear, CombatWeapon } from '../gearContract';
import { armourKept, armourSlows, armouredAttributes, STRENGTH_CARRIES } from './armour';
import { blowPower, strikeDamage } from './damage';
import { dodgeChance } from './defence';
import { focusDrive, focusScale } from './focus';
import { kitDamageScale } from './kit';
import { driveOf } from './verbs';
import {
  cutPower,
  NEEDS_WEAPON,
  PLAIN_THROW_SCALE,
  strikeWith,
  throwWith,
  weaponMissing,
  weaponNumbers,
} from './weapons';

function line(value: number, overrides: Partial<CombatAttributes> = {}): CombatAttributes {
  return {
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
    ...overrides,
  };
}

const plain = { attributes: line(10) };
const armed = (gear: CombatGear, attributes = line(10)) => ({ attributes, gear });
const weapon = (shape: CombatWeapon['shape'], rank: CombatWeapon['rank'] = 'D'): CombatWeapon => ({
  name: shape,
  shape,
  rank,
});

const wearing = (level: ArmourLevel): CombatGear => ({
  armour: { name: level, level, rank: 'D' },
});

const kenjutsuCut: CombatTechnique = {
  id: 'cut',
  name: 'Cut',
  discipline: 'kenjutsu',
  needs: { weapon: 'blade' },
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 5,
};
const sealing: CombatTechnique = {
  id: 'seal',
  name: 'Seal',
  discipline: 'fuuinjutsu',
  effects: [{ verb: 'seal', power: 8 }],
  chakraCost: 5,
};

describe('weapons', () => {
  it('a plain strike and plain kunai are what they always were', () => {
    expect(strikeWith(plain, plain, 0.5)).toMatchObject({ what: 'strike', kind: 'blow' });
    expect(strikeWith(plain, plain, 0.5).raw).toBe(strikeDamage(plain, plain, 0.5));
    expect(throwWith(plain, plain, 0.5).raw).toBeCloseTo(
      strikeDamage(plain, plain, 0.5) * PLAIN_THROW_SCALE,
    );
  });

  it('a blade turns the strike into a cut driven by kenjutsu', () => {
    const swordsman = armed({ held: weapon('blade') }, line(10, { kenjutsu: 20, taijutsu: 2 }));
    const cut = strikeWith(swordsman, plain, 0.5);
    expect(cut).toMatchObject({ what: 'cut', kind: 'weapon' });
    expect(cutPower(swordsman)).toBeGreaterThan(blowPower(swordsman));
    expect(cut.raw).toBeGreaterThan(strikeDamage(swordsman, plain, 0.5));
  });

  it('a better blade cuts deeper', () => {
    const d = strikeWith(armed({ held: weapon('blade', 'D') }), plain, 0.5).raw;
    const b = strikeWith(armed({ held: weapon('blade', 'B') }), plain, 0.5).raw;
    expect(b).toBeCloseTo(d * (1.45 / 1.25));
  });

  it('knuckles hit harder and go partly through a guard', () => {
    const fist = strikeWith(armed({ held: weapon('knuckles') }), plain, 0.5);
    expect(fist.raw).toBeGreaterThan(strikeWith(plain, plain, 0.5).raw);
    expect(fist.pierce).toBeGreaterThan(0);
    expect(weaponNumbers(weapon('knuckles', 'C')).pierce).toBeGreaterThan(fist.pierce);
  });

  it('throwing steel makes kunai hit harder; senbon softer, but they may daze', () => {
    const kunai = throwWith(plain, plain, 0.5).raw;
    expect(throwWith(armed({ thrown: weapon('throwing') }), plain, 0.5).raw).toBeGreaterThan(kunai);
    const senbon = throwWith(armed({ thrown: weapon('senbon') }), plain, 0.5);
    expect(senbon.raw).toBeLessThan(kunai);
    expect(senbon.what).toBe('senbon');
    expect(senbon.daze).toBeGreaterThan(0);
  });

  it('sharp eyes make senbon daze more often', () => {
    const needles = { thrown: weapon('senbon') };
    const sharp = throwWith(armed(needles, line(10, { perception: 20 })), plain, 0.5).daze;
    const dull = throwWith(armed(needles, line(10, { perception: 3 })), plain, 0.5).daze;
    expect(sharp).toBeGreaterThan(dull);
  });

  it('a unique weapon carries its own verbs', () => {
    const named: CombatWeapon = { ...weapon('blade', 'A'), effects: ['drain', 'daze', 'sunder'] };
    const n = weaponNumbers(named);
    expect(n.drain).toBeGreaterThan(0);
    expect(n.daze).toBeGreaterThan(0);
    expect(n.pierce).toBe(1);
    expect(weaponNumbers(weapon('blade', 'A'))).toMatchObject({ drain: 0, daze: 0, pierce: 0 });
  });

  it('a technique that needs a blade needs one in hand, for fighters whose gear is known', () => {
    expect(weaponMissing({ gear: {} }, kenjutsuCut)).toBe(NEEDS_WEAPON.blade);
    expect(weaponMissing({ gear: { held: weapon('knuckles') } }, kenjutsuCut)).toBe(
      NEEDS_WEAPON.blade,
    );
    expect(weaponMissing({ gear: { held: weapon('blade') } }, kenjutsuCut)).toBeNull();
    expect(weaponMissing({ gear: {} }, sealing)).toBeNull();
    // Foes and teammates are armed as their techniques suggest.
    expect(weaponMissing({}, kenjutsuCut)).toBeNull();
  });
});

describe('armour', () => {
  it('heavier armour lets less of a blow or blade through, but not a jutsu', () => {
    const levels = (['light', 'flak', 'heavy', 'plate'] as const).map((level) =>
      armourKept({ level, rank: 'D' }),
    );
    expect([...levels].sort((a, b) => b - a)).toEqual(levels);
    const plated = { traits: [], gear: wearing('plate') };
    expect(kitDamageScale(plated, 'blow')).toBe(levels[3]);
    expect(kitDamageScale(plated, 'weapon')).toBe(levels[3]);
    expect(kitDamageScale(plated, 'jutsu')).toBe(1);
  });

  it('a better rank protects a little more', () => {
    expect(armourKept({ level: 'heavy', rank: 'B' })).toBeLessThan(
      armourKept({ level: 'heavy', rank: 'D' }),
    );
  });

  it('an armoured kit keeps its protection when it also wears light armour', () => {
    const both = { traits: ['armoured' as const], gear: wearing('light') };
    expect(kitDamageScale(both, 'blow')).toBe(kitDamageScale({ traits: ['armoured'] }, 'blow'));
  });

  it('light armour costs no speed; heavier armour slows, and strength carries it', () => {
    expect(armourSlows({ level: 'light' }, 0)).toBe(0);
    expect(armourSlows({ level: 'plate' }, 5)).toBeGreaterThan(armourSlows({ level: 'heavy' }, 5));
    expect(armourSlows({ level: 'plate' }, 25)).toBeLessThan(armourSlows({ level: 'plate' }, 5));
    expect(armourSlows({ level: 'plate' }, STRENGTH_CARRIES)).toBe(0);
  });

  it('slowed by armour, a fighter dodges less', () => {
    const plate = wearing('plate');
    const slowed = { attributes: armouredAttributes(line(10), plate) };
    expect(slowed.attributes.speed).toBeLessThan(10);
    expect(dodgeChance(plain, slowed)).toBeLessThan(dodgeChance(plain, plain));
    const strong = { attributes: armouredAttributes(line(10, { strength: 30 }), plate) };
    expect(strong.attributes.speed).toBeGreaterThan(slowed.attributes.speed);
  });
});

describe('focus', () => {
  const brush: CombatGear = { focus: { name: 'Brush', rank: 'D', boosts: { verb: 'seal' } } };
  const beads: CombatGear = {
    focus: { name: 'Beads', rank: 'C', boosts: { discipline: 'kenjutsu' } },
  };

  it('sharpens the verb it covers, and nothing else', () => {
    const use = { technique: sealing, effect: { verb: 'seal' as const, power: 8 } };
    expect(driveOf(armed(brush), use)).toBeCloseTo(driveOf(plain, use) * focusScale({ rank: 'D' }));
    expect(focusDrive(armed(brush), 'confuse', 'genjutsu')).toBe(1);
  });

  it('sharpens every technique of the art it covers, more at a better rank', () => {
    expect(focusDrive(armed(beads), 'damage', 'kenjutsu')).toBe(focusScale({ rank: 'C' }));
    expect(focusScale({ rank: 'C' })).toBeGreaterThan(focusScale({ rank: 'D' }));
  });
});
