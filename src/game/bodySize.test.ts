import { newGame } from '@/test/gameFixtures';

import { clanSize } from './bodySize';
import { playerCombatant } from './combatants';
import { contextForPack } from './context';
import { companionCombatant } from './people/companions';

const naruto = contextForPack('naruto')!;

describe('bred size', () => {
  it('an Akimichi is born large; everyone else is human-sized', () => {
    expect(clanSize('akimichi', naruto)).toEqual({ size: 'large' });
    expect(clanSize('none', naruto)).toEqual({});
    expect(clanSize(undefined, naruto)).toEqual({});
  });

  it('rides into a fight with whoever is of the clan', () => {
    const state = newGame({}, naruto);
    const akimichi = naruto.content.people.all.find((p) => p.clanId === 'akimichi')!;
    expect(companionCombatant(akimichi, state, naruto, 'Genin').size).toBe('large');
    const born = { ...state, character: { ...state.character, clanId: 'akimichi' } };
    expect(playerCombatant(born, naruto).size).toBe('large');
    expect(playerCombatant(state, naruto).size).toBeUndefined();
  });
});
