import type { CombatAttributes } from '../contract';
import type { CombatGear, CombatWeapon } from '../gearContract';
import { masteryShare, MASTERY_FLOOR, weaponArt } from './mastery';
import { cutPower, throwPower, throwWith, weaponSkill } from './weapons';

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
  kenjutsu: 30,
  fuuinjutsu: 10,
};

const sword: CombatWeapon = { name: 'Sword', weaponClass: 'sword', rank: 'D' };
const shuriken: CombatWeapon = { name: 'Shuriken', weaponClass: 'throwing', rank: 'D' };
const senbon: CombatWeapon = { name: 'Senbon', weaponClass: 'senbon', rank: 'D' };

const armed = (gear: CombatGear) => ({ attributes: BASE, gear });
/** A weapons master who has only ever thrown: Tenten, before she meets a swordsman. */
const thrower = (gear: CombatGear) => armed({ ...gear, mastery: { throwing: 1 } });
/** A swordsman who has never thrown much: Mifune. */
const swordsman = (gear: CombatGear) => armed({ ...gear, mastery: { sword: 1 } });

describe('weapon mastery', () => {
  it('lets the whole art through for a known weapon, and half for one never held', () => {
    expect(masteryShare(thrower({}), 'throwing')).toBe(1);
    expect(masteryShare(thrower({}), 'sword')).toBe(MASTERY_FLOOR);
    expect(masteryShare(armed({ mastery: { sword: 0.5 } }), 'sword')).toBeCloseTo(0.75);
  });

  it('leaves a fighter whose gear is not known at home with any weapon', () => {
    expect(masteryShare({ attributes: BASE }, 'greatsword')).toBe(1);
    expect(weaponArt({ attributes: BASE }, 'chain')).toBe(BASE.kenjutsu);
  });

  it('the same art cuts deeper in a swordsman’s hand than a thrower’s', () => {
    expect(cutPower(swordsman({ held: sword }), sword)).toBeGreaterThan(
      cutPower(thrower({ held: sword }), sword),
    );
  });

  it('and throws better from the thrower’s', () => {
    const tenten = throwWith(thrower({ thrown: shuriken }), { attributes: BASE }, 0.5);
    const mifune = throwWith(swordsman({ thrown: shuriken }), { attributes: BASE }, 0.5);
    expect(tenten.raw).toBeGreaterThan(mifune.raw);
  });

  it('a throw is aimed by the eyes as well as the art', () => {
    const sharp = { attributes: { ...BASE, perception: 30 } };
    expect(throwPower(sharp, 'throwing')).toBeGreaterThan(
      throwPower({ attributes: BASE }, 'throwing'),
    );
  });

  it('a quick weapon arrives faster', () => {
    expect(weaponSkill(armed({ thrown: senbon, mastery: { senbon: 1 } }), true)).toBeGreaterThan(
      weaponSkill(armed({ thrown: shuriken, mastery: { throwing: 1 } }), true),
    );
  });
});
