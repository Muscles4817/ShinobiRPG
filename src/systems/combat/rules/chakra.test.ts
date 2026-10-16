import type { CombatAttributes, CombatTechnique } from '../contract';
import { chakraCost } from './body';
import { AREA_COST, areaCostScale, CHAKRA_REGEN, gathered } from './chakra';

const attributes: CombatAttributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 0,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

function technique(size?: 'small' | 'wide' | 'vast'): CombatTechnique {
  return {
    id: 't',
    name: 'T',
    discipline: 'ninjutsu',
    effects: [size ? { verb: 'area', power: 10, size } : { verb: 'damage', power: 10 }],
    chakraCost: 10,
  };
}

describe('chakra', () => {
  it('costs more for a technique that covers more ground', () => {
    expect(areaCostScale(technique())).toBe(1);
    expect(areaCostScale(technique('small'))).toBe(AREA_COST.small);
    expect(chakraCost({ attributes }, technique('wide'))).toBe(15);
    expect(chakraCost({ attributes }, technique('vast'))).toBeGreaterThan(
      chakraCost({ attributes }, technique('wide')),
    );
  });

  it('gathers a little back each exchange, more from deep reserves, never past the most', () => {
    expect(gathered({ chakra: 10, maxChakra: 50 })).toBe(10 + CHAKRA_REGEN);
    expect(gathered({ chakra: 10, maxChakra: 200 })).toBeGreaterThan(10 + CHAKRA_REGEN);
    expect(gathered({ chakra: 199, maxChakra: 200 })).toBe(200);
  });
});
