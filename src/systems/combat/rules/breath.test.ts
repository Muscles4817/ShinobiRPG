import type { CombatTechnique } from '../contract';
import { breathCost, breathed, isBodyMove, maxBreath } from './breath';

const kick: CombatTechnique = {
  id: 'kick',
  name: 'Kick',
  discipline: 'taijutsu',
  effects: [{ verb: 'damage', power: 10 }],
  chakraCost: 6,
};

describe('breath', () => {
  it('pays for plain taijutsu, not for moves that mould chakra', () => {
    expect(isBodyMove(kick)).toBe(true);
    expect(isBodyMove({ ...kick, element: 'wind' })).toBe(false);
    expect(isBodyMove({ ...kick, needsOpen: { ladder: 'gates', step: 1 } })).toBe(false);
    expect(isBodyMove({ ...kick, discipline: 'ninjutsu' })).toBe(false);
    expect(isBodyMove({ ...kick, moulded: true })).toBe(false);
    expect(isBodyMove({ ...kick, effects: [{ verb: 'drain', power: 8 }] })).toBe(false);
  });

  it('comes from stamina, and comes back a little each exchange', () => {
    expect(maxBreath({ stamina: 20 })).toBeGreaterThan(maxBreath({ stamina: 10 }));
    expect(breathed(0, { stamina: 10 })).toBeGreaterThan(0);
    expect(breathed(maxBreath({ stamina: 10 }), { stamina: 10 })).toBe(maxBreath({ stamina: 10 }));
  });

  it('costs a skilled hand less', () => {
    expect(breathCost({ attributes: { taijutsu: 30 } }, kick)).toBeLessThan(
      breathCost({ attributes: { taijutsu: 5 } }, kick),
    );
  });
});
