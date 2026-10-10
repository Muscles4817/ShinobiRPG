import { act, ctx, draft, newGame, postEverything, formTeam } from '@/test/gameFixtures';

import { newPostingsTomorrow } from './board';
import { createNewGame } from './creation';
import { blockerFor } from './dispatch';
import { deserialize } from './persistence/save';
import type { GameState } from './state';
import { hubView } from './views/hub';
import { marketView } from './views/market';
import { villageView } from './views/village';
import { festivalToday, rumoursToday } from './village';

const at = (state: GameState, day: number, slot = 0): GameState => ({
  ...state,
  time: { day, slot },
  board: { ...state.board, refreshedDay: day },
});

/** Kite Day falls on Spring 7. */
const KITE_DAY = 7;

function seer(): GameState {
  const fresh = createNewGame({ draft: draft({ clanId: 'tokaku' }), seed: 1234 }, ctx);
  return postEverything(formTeam(fresh));
}

describe('opening hours', () => {
  it('the forge shuts at night and the village screen says when it opens', () => {
    const night = at(newGame({ wallet: { ryo: 2000 } }), 1, 3);
    const forge = hubView(night, ctx).places.find((p) => p.id === 'kurogane-forge');
    expect(forge?.closed).toBe('Closed. Opens in the morning.');
    expect(blockerFor(night, { type: 'buyGear', gearId: 'wrapped-knuckles' }, ctx)).toBe(
      'Kurogane Forge is closed. Opens in the morning.',
    );
    expect(blockerFor(at(night, 2, 0), { type: 'buyGear', gearId: 'wrapped-knuckles' }, ctx)).toBe(
      null,
    );
  });

  it('stalls close one by one, but the noodle stand stays open late', () => {
    const night = at(newGame(), 1, 3);
    const stalls = marketView(night, ctx)!.stalls;
    expect(stalls.find((s) => s.name === 'Riverside Grill')?.closed).toBe(
      'Closed. Opens in the morning.',
    );
    expect(stalls.find((s) => s.name === "Kenji's Noodle Stand")?.closed).toBeNull();
    expect(blockerFor(night, { type: 'eat', foodId: 'ember-noodles' }, ctx)).toBeNull();
  });
});

describe('festivals', () => {
  it('are announced a week ahead', () => {
    const banner = villageView(at(newGame(), 1), ctx).festival;
    expect(banner).toMatchObject({ name: 'Kite Day', when: 'In 6 days', today: false });
    expect(villageView(at(newGame(), 20), ctx).festival).toBeNull();
  });

  it('bring market prices down on the day', () => {
    const state = at(newGame({ wallet: { ryo: 100 } }), KITE_DAY);
    expect(festivalToday(state, ctx)?.id).toBe('spring-kites');
    const fish = ctx.content.foods.require('grilled-fish');
    const price = Math.round(fish.cost * 0.7);
    const item = marketView(state, ctx)!
      .stalls.flatMap((s) => s.items)
      .find((i) => i.id === fish.id);
    expect(item?.cost).toBe(price);
    expect(act(state, { type: 'eat', foodId: fish.id }).wallet.ryo).toBe(100 - price);
  });

  it('make every conversation warmer', () => {
    const talk = (state: GameState) => {
      const talking = act(state, { type: 'talk', personId: 'kaen' });
      const replied = act(talking, { type: 'reply', choiceIndex: 0 });
      return replied.people.bonds.kaen?.points ?? 0;
    };
    const ordinary = talk(at(newGame(), 2));
    expect(talk(at(newGame(), KITE_DAY))).toBe(ordinary + 2);
  });
});

describe('village talk', () => {
  it('three rumours a day, changing from day to day', () => {
    const one = rumoursToday(at(newGame(), 3), ctx);
    expect(one).toHaveLength(3);
    const days = [3, 4, 5, 6].map((d) => rumoursToday(at(newGame(), d), ctx).map((r) => r.id));
    expect(new Set(days.map((d) => d.join())).size).toBeGreaterThan(1);
  });

  it('gossip about a job goes round the day before it is posted', () => {
    const quiet = { ...newGame(), board: { ...newGame().board, postings: [] } };
    const day = [...Array(40).keys()]
      .map((d) => d + 2)
      .find((d) => newPostingsTomorrow(at(quiet, d), ctx).length > 0);
    if (day === undefined) throw new Error('no job was ever posted');
    const tomorrow = new Set(newPostingsTomorrow(at(quiet, day), ctx));
    const hinted = rumoursToday(at(quiet, day), ctx).filter((r) => r.missionId !== undefined);
    expect(hinted.every((r) => tomorrow.has(r.missionId!))).toBe(true);
    const hintable = ctx.content.village.rumours.some(
      (r) => r.missionId && tomorrow.has(r.missionId),
    );
    expect(hinted.length > 0).toBe(hintable);
  });
});

describe('night sights', () => {
  it('only show at night, and only bloodline eyes see what they are', () => {
    expect(villageView(at(seer(), 1, 1), ctx).night).toBeNull();
    expect(villageView(at(seer(), 1, 3), ctx).night?.kind).toBe('seen');
    expect(villageView(at(newGame(), 1, 3), ctx).night?.kind).toBe('unseen');
    expect(blockerFor(at(newGame(), 1, 3), { type: 'followSight' }, ctx)).toBe(
      'Your eyes can’t see what walks the village at night.',
    );
  });

  it('following one teaches you something, once a night', () => {
    const night = at(seer(), 1, 3);
    const followed = act(night, { type: 'followSight' });
    const gained = Object.entries(followed.character.stats).filter(
      ([id, value]) => value > night.character.stats[id as keyof typeof night.character.stats],
    );
    expect(gained).toHaveLength(1);
    expect(followed.character.vitals.energy).toBe(night.character.vitals.energy - 10);
    expect(blockerFor(followed, { type: 'followSight' }, ctx)).toBe(
      'You’ve already followed it tonight.',
    );
  });
});

describe('saves', () => {
  it('a version 9 save has followed no spirits', () => {
    const { village: _village, ...v9 } = newGame();
    const loaded = deserialize(JSON.stringify({ version: 9, state: v9 }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.village).toEqual({ lastSightDay: null, lastRoundDay: null });
  });
});
