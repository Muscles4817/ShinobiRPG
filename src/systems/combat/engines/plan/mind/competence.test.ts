import type { CombatantSetup, CombatTechnique } from '../../../contract';
import { initialFighters } from '../state';
import { competenceOf, recognises, tierFor } from './competence';

/** Competence has more than one source (`competence.ts`). */

const base: CombatantSetup['attributes'] = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 20,
  intellect: 5,
  perception: 20,
  willpower: 20,
  taijutsu: 45,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

const palm: CombatTechnique = {
  id: 'hidden-palm',
  name: 'Hidden Palm',
  discipline: 'taijutsu',
  rank: 'A',
  chakraCost: 10,
  effects: [{ verb: 'damage', power: 30 }],
};

function fighter(attributes: CombatantSetup['attributes'], techniques: CombatTechnique[] = []) {
  const [f] = initialFighters({
    player: {
      id: 'p',
      name: 'p',
      attributes,
      health: 100,
      maxHealth: 100,
      chakra: 50,
      maxChakra: 50,
      techniques,
    },
    allies: [],
    enemies: [],
    canFlee: false,
  });
  return f!;
}

describe('competence', () => {
  it('lifts a dull mind to its art for a sequence inside that art', () => {
    const master = competenceOf(fighter(base));
    expect(master.tactical).toBe('E');
    expect(tierFor(master, ['taijutsu', 'taijutsu'])).toBe('S');
    expect(tierFor(master, ['taijutsu', 'ninjutsu'])).toBe('E');
    expect(tierFor(master, [])).toBe('E');
  });

  it('knows a technique it holds, or whose rank its art reaches', () => {
    const novice = fighter({ ...base, taijutsu: 5 });
    expect(recognises(fighter(base), palm)).toBe(true);
    expect(recognises(novice, palm)).toBe(false);
    expect(recognises(fighter({ ...base, taijutsu: 5 }, [palm]), palm)).toBe(true);
  });
});
