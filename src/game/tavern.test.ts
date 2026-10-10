import { act, ctx, newGame } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { deserialize } from './persistence/save';
import type { GameState } from './state';
import { hubView } from './views/hub';
import { tavernView } from './views/tavern';
import { rumoursOverheard, rumoursToday } from './village';

const NIGHT = 3;

const at = (slot: number, day = 2): GameState => {
  const state = newGame({ wallet: { ryo: 200 } });
  return { ...state, time: { day, slot }, board: { ...state.board, refreshedDay: day } };
};

describe('the izakaya', () => {
  it('only opens in the evening and at night', () => {
    const morning = at(0);
    const card = hubView(morning, ctx).places.find((p) => p.id === 'izakaya');
    expect(card?.closed).toBe('Closed. Opens this evening.');
    expect(tavernView(morning, ctx)?.closed).toBe('Closed. Opens this evening.');
    expect(blockerFor(morning, { type: 'eat', foodId: 'night-oden' }, ctx)).toBe(
      'The Paper Lantern is closed. Opens this evening.',
    );
    expect(hubView(at(NIGHT), ctx).places.find((p) => p.id === 'izakaya')?.closed).toBeNull();
  });

  it('is where the regulars spend their nights, and serves supper', () => {
    const night = at(NIGHT);
    const view = tavernView(night, ctx)!;
    expect(view.crowd.map((f) => f.id)).toEqual(expect.arrayContaining(['goran', 'kaen']));
    expect(hubView(night, ctx).places.find((p) => p.id === 'izakaya')?.line).toMatch(
      /regulars inside/,
    );
    const ate = act(night, { type: 'eat', foodId: 'night-oden' });
    expect(ate.wallet.ryo).toBe(200 - 20);
  });

  it('a round warms everyone inside, once a night, without using up a talk', () => {
    const night = at(NIGHT);
    const crowd = tavernView(night, ctx)!.crowd.map((f) => f.id);
    const after = act(night, { type: 'buyRound' });
    expect(after.wallet.ryo).toBe(200 - 40);
    for (const id of crowd) {
      expect(after.people.bonds[id]?.points).toBe((night.people.bonds[id]?.points ?? 0) + 3);
    }
    expect(blockerFor(after, { type: 'buyRound' }, ctx)).toBe(
      'You’ve already stood a round tonight.',
    );
    expect(blockerFor(after, { type: 'talk', personId: 'kaen' }, ctx)).toBeNull();
  });

  it('hears more than the street does', () => {
    const night = at(NIGHT, 5);
    expect(rumoursOverheard(night, ctx).length).toBeGreaterThan(rumoursToday(night, ctx).length);
    expect(tavernView(night, ctx)?.overheard).toHaveLength(rumoursOverheard(night, ctx).length);
  });

  it('a version 10 save has stood no rounds', () => {
    const state = newGame();
    const v10 = { ...state, village: { lastSightDay: null } };
    const loaded = deserialize(JSON.stringify({ version: 10, state: v10 }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.village).toEqual({ lastSightDay: null, lastRoundDay: null });
  });
});
