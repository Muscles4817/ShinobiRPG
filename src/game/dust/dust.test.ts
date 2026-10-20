import { ctx, draft } from '@/test/gameFixtures';
import { slotsUntilNextMorning } from '@/systems/time';

import { contextForPack } from '../context';

import { playerCombatant } from '../combatants';
import { createNewGame } from '../creation';
import { spendTime } from '../ops';
import { companionCombatant } from '../people/companions';
import type { GameState } from '../state';
import { dustCard } from '../views/dustCard';
import { yourDust } from './dust';
import { afterDustFight, dustDayPassed } from './keeping';

/** Commanded dust: born with the clan, carried into fights, kept, and gathered back by day. */

function ashChild(): GameState {
  return createNewGame({ draft: draft({ clanId: 'haibara' }), seed: 1234 }, ctx);
}

const victory = (dust: number) => ({
  result: 'victory' as const,
  rounds: 2,
  player: { health: 80, chakra: 10 },
  dust,
});

describe('commanded dust', () => {
  it('a child of a dust clan is born with a full store; others carry none', () => {
    const yours = yourDust(ashChild(), ctx);
    expect(yours?.def.id).toBe('ash');
    expect(yours?.store.count).toBe(yours?.cap);
    expect(yourDust(createNewGame({ draft: draft(), seed: 1234 }, ctx), ctx)).toBeNull();
  });

  it('rides into a fight and keeps what came back', () => {
    const state = ashChild();
    expect(playerCombatant(state, ctx).dust?.kind.name).toBe('Ash');
    expect(afterDustFight(state, victory(7), ctx).dust?.count).toBe(7);
  });

  it('ash gathers back at home; dust no ground gives does not', () => {
    const spent = afterDustFight(ashChild(), victory(0), ctx);
    const morning = spendTime(spent, slotsUntilNextMorning(spent.time), ctx);
    expect(morning.dust!.count).toBeGreaterThan(0);
    const iron = { ...spent, dust: { dustId: 'iron-sand', count: 0 } };
    expect(dustDayPassed(iron, ctx).dust!.count).toBe(0);
  });

  it('a clan child from a save before dust is given a store as a day passes', () => {
    const old = { ...ashChild(), dust: null };
    expect(dustDayPassed(old, ctx).dust?.dustId).toBe('ash');
  });

  it('people of a dust clan fight with a full store', () => {
    const head = ctx.content.people.require('rokuro');
    const fighter = companionCombatant(head, ashChild(), ctx, 'Clan head');
    expect(fighter.dust?.count).toBe(fighter.dust?.cap);
  });

  it('shows your dust on the Shinobi tab, with how it comes back', () => {
    const card = dustCard(afterDustFight(ashChild(), victory(0), ctx), ctx);
    expect(card?.name).toBe('Ash');
    expect(card?.state).toBe('Spent');
    expect(card?.banes).toEqual(['Wind']);
    expect(card?.gathering).toMatch(/home/);
  });

  it('a versus fighter fights with the dust their arsenal names', () => {
    const naruto = contextForPack('naruto')!;
    const game = createNewGame({ draft: draft(), seed: 1234 }, naruto);
    const gaara = companionCombatant(naruto.content.duelists.require('gaara'), game, naruto, '');
    expect(gaara.dust?.kind.name).toBe('Sand');
    expect(gaara.dust?.count).toBe(gaara.dust?.cap);
  });
});
