import { maxHealth } from '@/systems/vitals';
import { act, ctx, newGame, veteran, withAllStats } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { deserialize } from './persistence/save';
import type { GameState } from './state';
import { combatScene } from './views/scene';
import { trainingView } from './views/training';

/** Strikes until the fight ends. */
function fightOut(state: GameState): GameState {
  let current = state;
  for (let i = 0; i < 60 && current.combat; i++) {
    current = act(current, { type: 'combatAct', optionId: 'strike' });
  }
  return current;
}

function toRiverFight(start: GameState = newGame()): GameState {
  let state = act(veteran(start, 2), { type: 'startMission', missionId: 'river-road-bandits' });
  state = act(state, { type: 'missionContinue' });
  state = act(state, { type: 'missionChoose', approachIndex: 0 });
  return act(state, { type: 'missionContinue' });
}

describe('team missions', () => {
  it('your teammates fight beside you', () => {
    const view = combatScene(toRiverFight(), ctx)!;
    const yourSide = view.combatants.filter((c) => c.side === 'player');
    expect(yourSide).toHaveLength(3);
    expect(yourSide.slice(1).every((c) => c.tag === 'Teammate')).toBe(true);
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

describe('sensei lessons', () => {
  it('a weekly lesson grows your sensei’s specialty and your bond', () => {
    const state = newGame();
    const after = act(state, { type: 'lesson' });
    expect(after.character.stats.taijutsu).toBeGreaterThan(state.character.stats.taijutsu);
    expect(after.people.bonds.goran?.points).toBe(16);
    expect(after.reports.at(-1)).toMatchObject({
      kind: 'lesson',
      sensei: 'Gōran',
      technique: null,
    });
    expect(blockerFor(after, { type: 'lesson' }, ctx)).toBe('Your next lesson is in 7 days.');
  });

  it('friends are taught their sensei’s signature technique', () => {
    const state = newGame();
    const friends = {
      ...state,
      people: {
        ...state.people,
        bonds: { ...state.people.bonds, goran: { points: 30, lastTalkDay: null, heard: [] } },
      },
    };
    const after = act(friends, { type: 'lesson' });
    expect(after.techniques.progress['iron-gate-palm']).toBeGreaterThan(0);
    expect(trainingView(after, ctx)?.lesson?.signature).toMatchObject({
      name: 'Iron Gate Palm',
      locked: null,
    });
  });

  it('says what unlocks the signature technique', () => {
    expect(trainingView(newGame(), ctx)?.lesson?.signature?.locked).toBe(
      'Taught once you and Gōran are friends.',
    );
  });

  it('needs your sensei to be around', () => {
    const evening = { ...newGame(), time: { day: 1, slot: 3 } };
    expect(blockerFor(evening, { type: 'lesson' }, ctx)).toBe('Gōran is away right now.');
  });
});

describe('sparring', () => {
  it('a won spar teaches you something and brings you closer, without hospital', () => {
    const fight = act(withAllStats(newGame(), 40), { type: 'spar', personId: 'kaen' });
    expect(fight.people.sparringWith).toBe('kaen');
    expect(combatScene(fight, ctx)?.combatants.find((c) => c.side === 'enemy')?.tag).toBe(
      'Sparring',
    );
    const done = fightOut(fight);
    expect(done.people.sparringWith).toBeNull();
    expect(done.reports.at(-1)).toMatchObject({ kind: 'spar', result: 'won', bond: 5 });
    expect(done.character.stats.ninjutsu).toBeGreaterThan(40);
  });

  it('losing a spar stops before you are badly hurt', () => {
    const done = fightOut(act(withAllStats(newGame(), 2), { type: 'spar', personId: 'kaen' }));
    expect(done.reports.map((r) => r.kind)).toEqual(['spar']);
    expect(done.reports[0]).toMatchObject({ result: 'lost' });
    expect(done.character.vitals.health).toBeGreaterThanOrEqual(
      maxHealth(done.character.stats) / 2,
    );
    const mission = { type: 'startMission', missionId: 'lantern-keepers-cat' } as const;
    expect(blockerFor(done, mission, ctx) ?? '').not.toMatch(/injured/);
  });

  it('the training ground offers your teammates and genin training there', () => {
    const state = newGame();
    const offered = trainingView(state, ctx)!.sparring.map((s) => s.person.id);
    const teammates = state.people.team!.teammateIds;
    expect(offered.slice(0, 2).sort()).toEqual([...teammates].sort());
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
  it('a version 4 save gets lesson and sparring fields', () => {
    const state = newGame();
    const { lastLessonDay: _l, ...team } = state.people.team!;
    const { sparringWith: _s, ...people } = state.people;
    const v4 = { version: 4, state: { ...state, people: { ...people, team } } };
    const loaded = deserialize(JSON.stringify(v4));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.people.team?.lastLessonDay).toBeNull();
    expect(loaded.value.people.sparringWith).toBeNull();
  });
});
