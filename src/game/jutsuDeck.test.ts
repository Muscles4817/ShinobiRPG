import { effortOf } from '@/systems/combat';
import { ctx, newGame, withAllStats } from '@/test/gameFixtures';

import { playerCombatant } from './combatants';
import { jutsuDeck } from './views/you';

describe('the jutsu deck', () => {
  it('shows what a fight would charge: breath for a body move, less for a skilled hand', () => {
    const state = withAllStats(newGame(), 20);
    const palm = jutsuDeck(state, ctx).find((c) => c.id === 'palm-strike');
    const def = ctx.content.techniques.require('palm-strike');
    const fight = effortOf(playerCombatant(state, ctx), def);
    expect(palm?.cost).toEqual({ pool: 'breath', amount: fight.amount });
    expect(fight.amount).toBeLessThan(def.chakraCost);
  });

  it('charges a moulded technique chakra, after chakra control', () => {
    const state = withAllStats(newGame(), 20);
    const card = jutsuDeck(state, ctx).find((c) => c.id === 'pebble-volley');
    const def = ctx.content.techniques.require('pebble-volley');
    expect(card?.cost).toEqual(effortOf(playerCombatant(state, ctx), def));
    expect(card?.cost.pool).toBe('chakra');
  });
});
