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
    const cut: CombatTechnique = { ...kick, discipline: 'kenjutsu' };
    expect(isBodyMove(cut)).toBe(true);
    expect(isBodyMove({ ...cut, effects: [{ verb: 'afflict', power: 6, harm: 'bleed' }] })).toBe(
      true,
    );
    expect(isBodyMove({ ...kick, effects: [{ verb: 'afflict', power: 6, harm: 'bleed' }] })).toBe(
      false,
    );
    expect(isBodyMove({ ...kick, effects: [{ verb: 'drain', power: 8 }] })).toBe(false);
  });

  it('comes from stamina, and comes back a little each exchange', () => {
    expect(maxBreath({ stamina: 20 })).toBeGreaterThan(maxBreath({ stamina: 10 }));
    expect(breathed(0, { stamina: 10 })).toBeGreaterThan(0);
    expect(breathed(maxBreath({ stamina: 10 }), { stamina: 10 })).toBe(maxBreath({ stamina: 10 }));
  });

  it('costs a hand skilled in the move’s own art less', () => {
    const cut: CombatTechnique = { ...kick, discipline: 'kenjutsu' };
    expect(breathCost({ attributes: { taijutsu: 5, kenjutsu: 30 } }, cut)).toBeLessThan(
      breathCost({ attributes: { taijutsu: 30, kenjutsu: 5 } }, cut),
    );
  });

  it('costs a skilled hand less', () => {
    expect(breathCost({ attributes: { taijutsu: 30, kenjutsu: 5 } }, kick)).toBeLessThan(
      breathCost({ attributes: { taijutsu: 5, kenjutsu: 5 } }, kick),
    );
  });
});
