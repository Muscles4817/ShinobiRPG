import { bondWith } from '@/systems/bonds';
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
    expect(view.seats.map((s) => s.face.id)).toEqual(expect.arrayContaining(['goran', 'kaen']));
    expect(hubView(night, ctx).places.find((p) => p.id === 'izakaya')?.line).toMatch(
      /regulars inside/,
    );
    const ate = act(night, { type: 'eat', foodId: 'night-oden' });
    expect(ate.wallet.ryo).toBe(200 - 20);
  });

  it('a round warms everyone inside, once a night, without using up a talk', () => {
    const night = at(NIGHT);
    const crowd = tavernView(night, ctx)!.seats.map((s) => s.face.id);
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

  it('a drink with a regular is the day’s time with them, and the kind of night matters', () => {
    const night = at(NIGHT);
    // Kaen is brash and proud: a contest is their kind of night, a quiet cup is not.
    const contest = act(night, { type: 'drinkWith', personId: 'kaen', way: 'contest' });
    const quiet = act(night, { type: 'drinkWith', personId: 'kaen', way: 'quiet' });
    const before = night.people.bonds.kaen?.points ?? 0;
    expect(contest.wallet.ryo).toBe(200 - 12);
    expect(contest.people.bonds.kaen?.points).toBe(before + 15);
    expect(quiet.people.bonds.kaen?.points).toBe(Math.max(0, before - 1));
    expect(contest.journal.entries.at(-1)?.text).toMatch(/rematch/);
    expect(blockerFor(contest, { type: 'talk', personId: 'kaen' }, ctx)).toMatch(/already talked/);
    expect(blockerFor(contest, { type: 'drinkWith', personId: 'kaen', way: 'stories' }, ctx)).toBe(
      'You’ve already spent time with Kaen today.',
    );
  });

  it('only pours for someone who is in, while the bar is open', () => {
    expect(blockerFor(at(0), { type: 'drinkWith', personId: 'kaen', way: 'quiet' }, ctx)).toBe(
      'The Paper Lantern is closed. Opens this evening.',
    );
    expect(
      blockerFor(at(NIGHT), { type: 'drinkWith', personId: 'shiori', way: 'quiet' }, ctx),
    ).toBe('Shiori isn’t in tonight.');
    const broke = { ...at(NIGHT), wallet: { ryo: 5 } };
    expect(blockerFor(broke, { type: 'drinkWith', personId: 'kaen', way: 'quiet' }, ctx)).toBe(
      'A drink costs 12 ryo.',
    );
  });

  it('reads whether a night suits them once you know their tastes', () => {
    const night = at(NIGHT);
    const seat = (state: GameState) =>
      tavernView(state, ctx)!.seats.find((s) => s.face.id === 'kaen')!;
    expect(seat(night).drinks.map((d) => d.read)).toEqual([null, null, null]);
    const friends = {
      ...night,
      people: { ...night.people, bonds: { ...night.people.bonds, kaen: bondWith(30) } },
    };
    expect(seat(friends).drinks.map((d) => [d.id, d.read])).toEqual([
      ['stories', 'likes'],
      ['quiet', 'dislikes'],
      ['contest', 'likes'],
    ]);
  });

  it('shows what is played at the back tables', () => {
    expect(tavernView(at(NIGHT), ctx)?.pastimes.map((p) => p.id)).toEqual([
      'lantern-dice',
      'shogi',
    ]);
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
    expect(loaded.value.village).toMatchObject({ lastSightDay: null, lastRoundDay: null });
  });
});
