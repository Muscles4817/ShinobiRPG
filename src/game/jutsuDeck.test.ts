import { chakraCost } from '@/systems/combat';
import { ctx, newGame, withAllStats } from '@/test/gameFixtures';

import { playerCombatant } from './combatants';
import { jutsuDeck } from './views/you';

describe('the jutsu deck', () => {
  it('shows the chakra a fight would charge, after chakra control', () => {
    const state = withAllStats(newGame(), 20);
    const palm = jutsuDeck(state, ctx).find((c) => c.id === 'palm-strike');
    const def = ctx.content.techniques.require('palm-strike');
    const fight = chakraCost(playerCombatant(state, ctx), def);
    expect(palm?.chakraCost).toBe(fight);
    expect(fight).toBeLessThan(def.chakraCost);
  });
});
