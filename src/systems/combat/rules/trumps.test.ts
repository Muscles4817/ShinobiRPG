import type { CombatTechnique } from '../contract';
import { afterUsing, costsOwed, trumpSpent } from './trumps';

const blaze: CombatTechnique = {
  id: 'blaze',
  name: 'Blaze',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 30 }],
  chakraCost: 20,
  oncePerFight: true,
  afterCost: { kind: 'exhaustion', days: 2 },
};
const jab: CombatTechnique = {
  id: 'jab',
  name: 'Jab',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 6 }],
  chakraCost: 2,
};

describe('trump cards', () => {
  it('a trump is spent once used; ordinary techniques never are', () => {
    const fresh = {};
    expect(trumpSpent(fresh, blaze)).toBe(false);
    const used = { trumpsUsed: afterUsing(fresh, blaze) };
    expect(trumpSpent(used, blaze)).toBe(true);
    expect(afterUsing(used, jab)).toEqual(['blaze']);
    expect(trumpSpent({ trumpsUsed: ['jab'] }, jab)).toBe(false);
  });

  it('owes the after-cost of each trump used', () => {
    expect(costsOwed({ techniques: [blaze, jab] })).toEqual([]);
    expect(costsOwed({ techniques: [blaze, jab], trumpsUsed: ['blaze'] })).toEqual([
      { techniqueId: 'blaze', techniqueName: 'Blaze', cost: { kind: 'exhaustion', days: 2 } },
    ]);
  });
});
