import { MAX_HEALTH } from '@/systems/vitals';
import { act, ctx, fightOut, intoFight, newGame, veteran, withAllStats } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { deserialize } from './persistence/save';
import type { GameState } from './state';
import { combatScene } from './views/scene';
import { trainingView } from './views/training';

function toRiverFight(start: GameState = newGame()): GameState {
  let state = act(veteran(start, 2), { type: 'startMission', missionId: 'river-road-bandits' });
  state = act(state, { type: 'missionContinue' });
  state = act(state, { type: 'missionChoose', approachIndex: 0 });
  return intoFight(state);
}

describe('team missions', () => {
  it('your teammates fight beside you', () => {
    const view = combatScene(toRiverFight(), ctx)!;
    const yourSide = view.combatants.filter((c) => c.side === 'player');
    expect(yourSide.map((c) => c.tag)).toEqual([undefined, 'Teammate', 'Teammate', 'Sensei']);
  });

  it('finishing one together brings the team closer', () => {
    const fight = toRiverFight(withAllStats(newGame(), 60));
    const before = fight.people.bonds['genin-1']?.points ?? 0;
    const done = fightOut(fight);
    expect(done.mission).toBeNull();
    expect(done.people.bonds['genin-1']?.points).toBe(before + 6);
    expect(done.reports.at(-1)).toMatchObject({ kind: 'mission-complete', teamBond: 6 });
  });
});

describe('sparring', () => {
  it('a won spar teaches you something and brings you closer, without hospital', () => {
    const strong = withAllStats(newGame(), 40);
    // A spar teaches what you used against a partner as good as you: leave room to grow.
    const room = { ...strong.character.stats, taijutsu: 5, strength: 5 };
    const learner = { ...strong, character: { ...strong.character, stats: room } };
    const fight = act(learner, { type: 'spar', personId: 'kaen' });
    expect(fight.people.sparringWith).toBe('kaen');
    expect(combatScene(fight, ctx)?.combatants.find((c) => c.side === 'enemy')?.tag).toBe(
      'Sparring',
    );
    const done = fightOut(fight);
    expect(done.people.sparringWith).toBeNull();
    expect(done.reports.at(-1)).toMatchObject({ kind: 'spar', result: 'won', bond: 5 });
    expect(done.character.stats.taijutsu).toBeGreaterThan(5);
    const card = done.reports.at(-1);
    const gains = card?.kind === 'spar' ? card.gains : [];
    expect(gains.some((g) => /^Taijutsu( \+|, )/.test(g))).toBe(true);
  });

  it('losing a spar stops before you are badly hurt', () => {
    const done = fightOut(act(withAllStats(newGame(), 2), { type: 'spar', personId: 'kaen' }));
    expect(done.reports.map((r) => r.kind)).toEqual(['spar']);
    expect(done.reports[0]).toMatchObject({ result: 'lost' });
    expect(done.character.vitals.health).toBeGreaterThanOrEqual(MAX_HEALTH / 2);
    const mission = { type: 'startMission', missionId: 'lantern-keepers-cat' } as const;
    expect(blockerFor(done, mission, ctx) ?? '').not.toMatch(/injured/);
  });

  it('the training ground offers your teammates and genin training there', () => {
    const state = newGame();
    const offered = trainingView(state, ctx)!.sparring.map((s) => s.person.id);
    const teammates = state.people.team!.teammateIds;
    // Your rival, when they train here, is offered first; your teammates come next.
    const besidesRival = offered.filter((id) => id !== state.rival?.personId);
    expect(besidesRival.slice(0, 2).sort()).toEqual([...teammates].sort());
    expect(offered).toContain('kaen');
    expect(offered).not.toContain('kenji');
  });

  it('only genin spar, once a day', () => {
    const state = newGame();
    expect(blockerFor(state, { type: 'spar', personId: 'goran' }, ctx)).toBe(
      'Gōran doesn’t spar with genin.',
    );
    const done = fightOut(act(withAllStats(state, 40), { type: 'spar', personId: 'kaen' }));
    expect(blockerFor(done, { type: 'spar', personId: 'kaen' }, ctx)).toMatch(/already spent time/);
  });
});

describe('saves', () => {
  it('a version 4 save gets sparring and teaching fields', () => {
    const state = newGame();
    const { sparringWith: _s, taught: _t, favours: _f, ...people } = state.people;
    const v4 = { version: 4, state: { ...state, people } };
    const loaded = deserialize(JSON.stringify(v4));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.people.sparringWith).toBeNull();
    expect(loaded.value.people.taught).toEqual({});
    expect(loaded.value.people.favours).toEqual([]);
  });
});
