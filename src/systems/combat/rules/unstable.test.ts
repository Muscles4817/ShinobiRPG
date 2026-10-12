import type { CombatTechnique } from '../contract';
import { chakraCost, type Body } from './body';
import { misfireChance, UNSTABLE_CHAKRA, UNSTABLE_MISFIRE } from './unstable';

const bolt: CombatTechnique = {
  id: 'bolt',
  name: 'Bolt',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 20,
};

describe('unstable techniques', () => {
  it('cost more chakra, before chakra control takes its share off', () => {
    // Only the attributes are read for a cost.
    const user = { attributes: { chakraControl: 0 } } as unknown as Body;
    expect(chakraCost(user, bolt)).toBe(20);
    expect(chakraCost(user, { ...bolt, unstable: true })).toBe(20 * UNSTABLE_CHAKRA);
  });

  it('can misfire; stable ones never do', () => {
    expect(misfireChance(bolt)).toBe(0);
    expect(misfireChance({ ...bolt, unstable: true })).toBe(UNSTABLE_MISFIRE);
  });
});
