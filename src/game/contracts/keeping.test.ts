import { act, ctx, newGame } from '@/test/gameFixtures';
import { blockerFor } from '@/game';
import { OFFERING_STANDING } from '@/systems/contracts';
import { pantryCount, stock } from '@/systems/inventory';

import { handedOver } from '../missionRewards';
import type { GameState } from '../state';
import { signContract } from './summons';

const offer = { type: 'makeOffering', ingredientId: 'chestnuts' } as const;

function signedWithChestnuts(): GameState {
  const state = signContract(newGame(), ctx, 'kiln-salamanders');
  return { ...state, inventory: stock(stock(state.inventory, 'chestnuts'), 'chestnuts') };
}

describe('keeping a contract', () => {
  it('an offering the clan likes, left at home, raises your standing once a day', () => {
    const state = signedWithChestnuts();
    const given = act(state, offer);
    expect(given.contract?.standing).toBe(OFFERING_STANDING);
    expect(pantryCount(given.inventory, 'chestnuts')).toBe(1);
    expect(blockerFor(given, offer, ctx)).toMatch(/today/);
    expect(blockerFor(state, { ...offer, ingredientId: 'rice' }, ctx)).toMatch(/doesn’t care/);
    expect(blockerFor(newGame(), offer, ctx)).toMatch(/no contract/);
  });

  it('breaking a contract frees you to sign another, but never that one again', () => {
    const broken = act(signedWithChestnuts(), { type: 'breakContract' });
    expect(broken.contract).toBeNull();
    expect(broken.brokenContracts).toEqual(['kiln-salamanders']);
    const job = ctx.content.missions.all.find((m) => m.reward.contractId === 'kiln-salamanders')!;
    expect(handedOver(broken, ctx, job).contract).toBeNull();
    expect(handedOver(newGame(), ctx, job).contract?.contractId).toBe('kiln-salamanders');
  });
});
