import type { CombatAttributes } from '../contract';
import { CHANNELLED_GRIP, escapeChance, rescueChance } from './escape';
import type { HoldGrip } from './verbs';

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

const wire: HoldGrip = { drive: 10, discipline: 'taijutsu', resist: ['bind'] };
const prison: HoldGrip = { drive: 10, discipline: 'ninjutsu', resist: ['bind'] };

describe('breaking a hold', () => {
  it('an equal struggles free a quarter of the time each exchange', () => {
    expect(escapeChance(at(), wire, false)).toBeCloseTo(0.25);
  });

  it('is broken by what fights its kind: strength for wire, chakra control for chakra', () => {
    expect(escapeChance(at({ strength: 20 }), wire, false)).toBeGreaterThan(
      escapeChance(at(), wire, false),
    );
    expect(escapeChance(at({ strength: 20 }), prison, false)).toBe(
      escapeChance(at(), prison, false),
    );
    expect(escapeChance(at({ chakraControl: 20 }), prison, false)).toBeGreaterThan(
      escapeChance(at(), prison, false),
    );
  });

  it('a stronger cast holds better', () => {
    expect(escapeChance(at(), { ...wire, drive: 20 }, false)).toBeLessThan(
      escapeChance(at(), wire, false),
    );
  });

  it('a teammate pulling them out does better than struggling alone', () => {
    expect(rescueChance(at(), wire, false)).toBeGreaterThan(escapeChance(at(), wire, false));
  });

  it('a channelled hold is much harder to break while its caster holds it', () => {
    expect(escapeChance(at(), prison, true)).toBeCloseTo(
      escapeChance(at(), prison, false) * CHANNELLED_GRIP,
    );
    expect(rescueChance(at(), prison, true)).toBeLessThan(rescueChance(at(), prison, false));
  });

  it('is never certain, and never hopeless', () => {
    expect(escapeChance(at({ strength: 100 }), wire, false)).toBeLessThan(1);
    expect(escapeChance(at({ strength: 1 }), { ...wire, drive: 100 }, false)).toBeGreaterThan(0);
  });
});
