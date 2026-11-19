import type { CombatTechnique } from '../contract';
import { AREA_REACH, chakraWorth, VERB_WORTH } from './worth';

/** What a technique is worth in chakra: what it does, priced steeply by how far it reaches. */

const strike: CombatTechnique = {
  id: 'strike',
  name: 'Strike',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 20 }],
  chakraCost: 0,
};

describe('chakra worth', () => {
  it('reads each effect by its power and what its verb does to a fight', () => {
    expect(chakraWorth(strike)).toBe(Math.round(20 * VERB_WORTH.damage));
    const held = { ...strike, effects: [{ verb: 'pin' as const, power: 20 }] };
    expect(chakraWorth(held)).toBeGreaterThan(chakraWorth(strike));
  });

  it('multiplies the lot steeply by the ground it covers', () => {
    const area = (size: 'small' | 'wide' | 'vast') => ({
      ...strike,
      effects: [{ verb: 'area' as const, power: 20, size }],
    });
    expect(chakraWorth(area('vast'))).toBe(Math.round(20 * VERB_WORTH.area * AREA_REACH.vast));
    expect(chakraWorth(area('vast'))).toBeGreaterThan(chakraWorth(area('wide')) * 2);
    expect(chakraWorth(area('wide'))).toBeGreaterThan(chakraWorth(area('small')));
  });

  it('asks more of a sure or killing technique, and nothing of a Gate', () => {
    expect(chakraWorth({ ...strike, accuracy: 'sure' })).toBeGreaterThan(chakraWorth(strike));
    expect(chakraWorth({ ...strike, lethal: true })).toBeGreaterThan(chakraWorth(strike));
    const gate: CombatTechnique = {
      ...strike,
      effects: [
        {
          verb: 'empower',
          power: 20,
          boosts: ['speed'],
          opens: { ladder: 'gates', step: 1 },
        },
      ],
    };
    expect(chakraWorth(gate)).toBe(0);
  });
});
