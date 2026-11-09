import type { CombatantSetup, CombatTechnique } from '../../contract';
import { sightInstinct } from './sight';
import { initialFighters } from './state';

/** What instinct reaches for to see, hide or blind: here, raising a field. */

const attributes = {
  strength: 5,
  speed: 5,
  stamina: 5,
  chakraControl: 5,
  intellect: 5,
  perception: 5,
  willpower: 5,
  taijutsu: 5,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

const fog: CombatTechnique = {
  id: 'fog',
  name: 'Fog',
  discipline: 'ninjutsu',
  effects: [{ verb: 'field', field: 'mist', power: 10 }],
  chakraCost: 6,
};

function setup(id: string): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 50,
    maxHealth: 50,
    chakra: 30,
    maxChakra: 30,
    techniques: [fog],
  };
}

const [hero] = initialFighters({
  player: setup('hero'),
  allies: [],
  enemies: [setup('foe')],
  canFlee: true,
});
const ready = [{ kind: 'jutsu', technique: fog } as const];

describe('raising a field on instinct', () => {
  it('raises one mid-round whenever none of its side is up, as a plan does', () => {
    const moment = { hiddenFoe: false, opening: false, fieldUp: false };
    expect(sightInstinct(hero!, ready, moment)).toEqual(ready[0]);
  });

  it('never while its own is up', () => {
    const moment = { hiddenFoe: false, opening: true, fieldUp: true };
    expect(sightInstinct(hero!, ready, moment)).toBeUndefined();
  });
});
