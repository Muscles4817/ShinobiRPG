import { act, ctx, newGame } from '@/test/gameFixtures';
import { bondWith } from '@/systems/bonds';

import { blockerFor } from './dispatch';
import type { GameState } from './state';
import { kitchenView } from './views/kitchen';
import { marketView } from './views/market';

const EVENING = 2;

/** An evening at home with a stocked pantry, on friendly terms with Kaen. */
function evening(overrides: { points?: number; day?: number } = {}): GameState {
  const state = newGame();
  return {
    ...state,
    time: { day: overrides.day ?? 2, slot: EVENING },
    board: { ...state.board, refreshedDay: overrides.day ?? 2 },
    inventory: {
      ...state.inventory,
      pantry: { 'river-fish': 2, vegetables: 2, miso: 2, spices: 2, rice: 4 },
    },
    people: {
      ...state.people,
      bonds: { ...state.people.bonds, kaen: bondWith(overrides.points ?? 12) },
    },
  };
}

const invite = (recipeId: string) => ({ type: 'hostDinner', recipeId, guestId: 'kaen' }) as const;

describe('dinner invites', () => {
  it('cooking for two uses twice the ingredients and counts as time together', () => {
    const state = evening();
    const after = act(state, invite('rice-ball-bento'));
    expect(after.inventory.pantry.rice).toBeUndefined();
    expect(after.people.bonds.kaen?.points).toBe(12 + 6);
    expect(after.character.meal).toBe('rice-ball-bento');
    expect(after.time.slot).toBe(EVENING + 1);
    expect(after.people.bonds.kaen?.lastTalkDay).toBe(2);
  });

  it('their favourite dish means more', () => {
    const after = act(evening(), invite('spicy-hot-pot'));
    expect(after.people.bonds.kaen?.points).toBe(12 + 12);
    expect(after.journal.entries.at(-1)?.text).toContain('favourite');
    const card = kitchenView(evening(), ctx).recipes.find((r) => r.id === 'spicy-hot-pot');
    expect(card?.invites.find((g) => g.guestId === 'kaen')).toMatchObject({
      favourite: true,
      stage: 'Acquaintance',
      blocker: null,
    });
  });

  it('only friends, only in the evening, only with enough for two', () => {
    expect(blockerFor(evening({ points: 3 }), invite('miso-soup'), ctx)).toBe(
      'You don’t know Kaen well enough yet.',
    );
    const morning = { ...evening(), time: { day: 2, slot: 0 } };
    expect(blockerFor(morning, invite('miso-soup'), ctx)).toBe('Guests come round in the evening.');
    const short = { ...evening(), inventory: { ...evening().inventory, pantry: { rice: 2 } } };
    expect(blockerFor(short, invite('miso-soup'), ctx)).toBe(
      'Cooking for two. Needs Miso, Vegetables.',
    );
  });

  it('outside the evening the kitchen says why once, not per guest', () => {
    const card = kitchenView({ ...evening(), time: { day: 2, slot: 0 } }, ctx).recipes[0];
    expect(card?.inviteBlocker).toBe('Guests come round in the evening.');
    expect(card?.invites).toEqual([]);
  });

  it('strangers are not on the guest list', () => {
    const view = kitchenView(evening({ points: 0 }), ctx);
    const guests = view.recipes[0]?.invites.map((g) => g.guestId) ?? [];
    expect(guests).not.toContain('kaen');
  });
});

describe('festival stalls', () => {
  /** Kite Day falls on Spring 7. */
  const kiteDay = (slot: number): GameState => ({
    ...newGame({ wallet: { ryo: 100 } }),
    time: { day: 7, slot },
  });

  it('set up in the market only on their day', () => {
    const stalls = marketView(kiteDay(1), ctx)!.stalls;
    expect(stalls[0]).toMatchObject({ name: 'Kite Day Sweets', festival: true, closed: null });
    const ordinary = { ...kiteDay(1), time: { day: 8, slot: 1 } };
    expect(marketView(ordinary, ctx)!.stalls.some((s) => s.festival)).toBe(false);
    expect(blockerFor(ordinary, { type: 'eat', foodId: 'kite-candy' }, ctx)).toBe(
      'That isn’t sold here.',
    );
  });

  it('sell festival food at festival prices once they open', () => {
    expect(blockerFor(kiteDay(0), { type: 'eat', foodId: 'kite-candy' }, ctx)).toBe(
      'Kite Day Sweets is closed. Opens this afternoon.',
    );
    const ate = act(kiteDay(1), { type: 'eat', foodId: 'kite-candy' });
    expect(ate.wallet.ryo).toBe(100 - Math.round(8 * 0.7));
  });
});
