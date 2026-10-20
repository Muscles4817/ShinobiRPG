import type { CombatantSetup, CombatTechnique } from '../../contract';
import { maxBreath } from '../../rules/breath';
import { playable } from './cards';
import { affords, breathOf, payFor, rested } from './effort';
import { initialFighters, type PlanFighter } from './state';

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 12,
  chakraControl: 5,
  intellect: 8,
  perception: 8,
  willpower: 8,
  taijutsu: 14,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

const sweep: CombatTechnique = {
  id: 'sweep',
  name: 'Sweep',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 6,
};
const galeKick: CombatTechnique = { ...sweep, id: 'gale-kick', element: 'wind' };

function fighter(overrides: Partial<CombatantSetup> = {}): PlanFighter {
  const setup: CombatantSetup = {
    id: 'hero',
    name: 'hero',
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 0,
    maxChakra: 30,
    techniques: [sweep, galeKick],
    ...overrides,
  };
  const [f] = initialFighters({ player: setup, allies: [], enemies: [], canFlee: true });
  return f!;
}

describe('effort', () => {
  it('lets a body move be thrown with no chakra and under a seal', () => {
    const sealed = { ...fighter(), sealed: 2 };
    expect(playable(sealed, { kind: 'jutsu', technique: sweep })).toBe(true);
    expect(playable(sealed, { kind: 'jutsu', technique: galeKick })).toBe(false);
  });

  it('spends breath on a body move and chakra on anything else', () => {
    const f = { ...fighter(), chakra: 30 };
    expect(payFor(f, sweep)).toEqual({ breath: maxBreath(attributes) - 5 });
    expect(payFor(f, galeKick)).toMatchObject({ chakra: 24 });
  });

  it('runs out, and a winded fighter can only rest', () => {
    const winded = { ...fighter(), breath: 2 };
    expect(affords(winded, sweep)).toBe(false);
    const after = { ...winded, ...rested(winded) };
    expect(breathOf(after)).toBeGreaterThan(2);
  });
});
