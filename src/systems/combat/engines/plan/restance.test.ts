import type { CombatantSetup, CombatTechnique } from '../../contract';
import { foeStances } from './foeTeam';
import { foesRestanced } from './restance';
import { initialFighters, type PlanFighter } from './state';
import { withStances } from './team';

/** Foes who fight as a team look at the team again between rounds. */

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 4,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const bind: CombatTechnique = {
  id: 'bind',
  name: 'Bind',
  discipline: 'ninjutsu',
  effects: [{ verb: 'pin', power: 10 }],
  chakraCost: 5,
};

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 30,
    maxChakra: 30,
    techniques: [],
    ...overrides,
  };
}

function team(): PlanFighter[] {
  const leader = { attributes: { ...attributes, intellect: 16 } };
  const enemies = [
    setup('brute', { ...leader, row: 'front', maxHealth: 140, health: 140 }),
    setup('thug', { row: 'front' }),
    setup('caster', { row: 'back', techniques: [bind] }),
  ];
  const fighters = initialFighters({ player: setup('hero'), allies: [], enemies, canFlee: true });
  return withStances(foeStances(fighters));
}

const down = (fighters: readonly PlanFighter[], id: string) =>
  fighters.map((f) => (f.id === id ? { ...f, health: 0 } : f));
const stanceOf = (fighters: readonly PlanFighter[], id: string) =>
  fighters.find((f) => f.id === id)?.stance;

describe('foes restanced between rounds', () => {
  it('a cover whose ward has fallen presses instead', () => {
    const before = team();
    expect(stanceOf(before, 'brute')).toEqual({ kind: 'cover', covers: 'caster' });
    expect(stanceOf(foesRestanced(down(before, 'caster')), 'brute')).toEqual({ kind: 'press' });
  });

  it('with the one who called the plays down, the rest keep stances that still fit', () => {
    const after = foesRestanced(down(team(), 'brute'));
    expect(stanceOf(after, 'caster')).toEqual({ kind: 'support' });
    expect(stanceOf(after, 'thug')).toEqual({ kind: 'press' });
  });

  it('a foe whose stance still fits keeps its plan as it is', () => {
    const before = team();
    const after = foesRestanced(before);
    expect(after).toEqual(before);
  });
});
