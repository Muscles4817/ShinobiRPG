import type { CombatAttributes } from '../contract';
import { kitDamageScale } from './kit';
import { shroudedAttributes, shroudKept, shroudOf, wornShroud } from './shrouds';

const attributes: CombatAttributes = {
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

describe('cast armour', () => {
  it('lightning turns most blows and jutsu and quickens its wearer, but wind cuts through', () => {
    const shrouded = { shroud: shroudOf('lightning', 15) };
    expect(shroudKept(shrouded, 'cut')).toBeLessThan(0.6);
    expect(shroudKept(shrouded, 'fire')).toBeLessThan(0.7);
    expect(shroudKept(shrouded, 'wind')).toBeGreaterThan(1);
    expect(shroudKept(shrouded, 'mind')).toBe(1);
    expect(shroudedAttributes(attributes, 'lightning', true).speed).toBeGreaterThan(10);
    const back = shroudedAttributes(
      shroudedAttributes(attributes, 'lightning', true),
      'lightning',
      false,
    );
    expect(back.speed).toBeCloseTo(10);
  });

  it('lies on top of worn armour and a foe’s armoured kit', () => {
    const plain = { traits: [] };
    const shrouded = { traits: [], shroud: shroudOf('earth', 10) };
    expect(kitDamageScale(shrouded, 'blow', 'blunt')).toBeLessThan(
      kitDamageScale(plain, 'blow', 'blunt'),
    );
    // Lightning splits stone.
    expect(kitDamageScale(shrouded, 'jutsu', 'lightning')).toBeGreaterThan(1);
  });

  it('sand stops nearly anything but wears away under sustained hurt', () => {
    const shell = shroudOf('sand', 10);
    expect(shell.integrity).toBe(30);
    const once = wornShroud(shell, 'cut', 3);
    expect(once?.integrity).toBeLessThan(30);
    expect(wornShroud(shell, 'cut', 40)).toBeNull();
    // An illusion never touches it.
    expect(wornShroud(shell, 'mind', 10)).toBe(shell);
  });

  it('a shroud that never wears holds whatever it takes', () => {
    const lightning = shroudOf('lightning', 10);
    expect(lightning.integrity).toBeUndefined();
    expect(wornShroud(lightning, 'cut', 99)).toBe(lightning);
  });
});
