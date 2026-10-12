import { act, intoFight, newGame, veteran } from '@/test/gameFixtures';

import { deserialize, SAVE_VERSION, serialize } from './save';

describe('persistence', () => {
  it('round-trips a game, including an in-progress fight', () => {
    let state = act(newGame({ standing: { ...newGame().standing, missionsCompleted: 5 } }), {
      type: 'startMission',
      missionId: 'tea-merchant-escort',
    });
    state = act(state, { type: 'missionContinue' });
    state = act(state, { type: 'missionChoose', approachIndex: 0 });
    state = intoFight(state);
    expect(state.combat).not.toBeNull();
    expect(deserialize(serialize(state))).toEqual({ ok: true, value: state });
  });

  it('upgrades a version 1 save from the first release', () => {
    const v1 = {
      version: 1,
      state: {
        rngState: 5,
        time: { day: 3, slot: 2 },
        character: {
          name: 'Old',
          aptitudeId: 'taijutsu',
          stats: newGame().character.stats,
          vitals: newGame().character.vitals,
        },
        wallet: { ryo: 120 },
        techniques: { known: ['palm-strike'], progress: {} },
        standing: newGame().standing,
        journal: { entries: [{ id: 1, day: 1, text: 'Hello', tone: 'info' }], nextId: 2 },
        mission: {
          missionId: 'shrine-weeding',
          stageIndex: 0,
          rewardMultiplier: 1,
          notes: ['Old note'],
        },
        combat: null,
      },
    };
    const loaded = deserialize(JSON.stringify(v1));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value).toMatchObject({
      packId: 'original',
      locationId: 'torogakure',
      housing: { placeId: 'home', paidThroughDay: 9 },
      reports: [],
      mission: { notes: [{ kind: 'story', text: 'Old note' }] },
    });
    expect(loaded.value.journal.entries[0]).toMatchObject({ slot: 0, text: 'Hello' });
    expect(loaded.value.character.startingStats).toEqual(loaded.value.character.stats);
  });

  it('upgrades a version 2 save to the full character profile', () => {
    const { character, ...rest } = newGame();
    const {
      familyName: _f,
      pronouns: _p,
      appearance: _a,
      clanId: _c,
      grades: _g,
      nature: _n,
      traitIds: _t,
      talentId: _ta,
      nindoId: _ni,
      breakIn: _b,
      ...oldCharacter
    } = character;
    const strip = ({ kenjutsu: _k, fuuinjutsu: _fu, ...s }: typeof character.stats) => s;
    const v2 = {
      version: 2,
      state: {
        ...rest,
        character: {
          ...oldCharacter,
          aptitudeId: 'ninjutsu',
          stats: strip(character.stats),
          startingStats: strip(character.startingStats),
        },
      },
    };
    const loaded = deserialize(JSON.stringify(v2));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.character).toMatchObject({
      clanId: 'none',
      grades: { ninjutsu: 'A', taijutsu: 'C' },
      traitIds: [],
      talentId: null,
      stats: { kenjutsu: 5, fuuinjutsu: 5 },
    });
    expect('aptitudeId' in loaded.value.character).toBe(false);
  });

  it('gives a character from before aptitude the growth their clan and talent gave them', () => {
    const game = newGame();
    const { aptitude: _a, aptitudeKnown: _k, aptitudeSessions: _s, ...old } = game.character;
    const hardWorker = { ...old, clanId: 'kurogane', talentId: 'hard-worker' };
    const raw = JSON.stringify({ version: 17, state: { ...game, character: hardWorker } });
    const loaded = deserialize(raw);
    if (!loaded.ok) throw new Error(loaded.error);
    const { character } = loaded.value;
    expect(character.aptitude.taijutsu).toBeCloseTo(1.4);
    expect(character.aptitude.kenjutsu).toBeCloseTo(1.2);
    expect(character.aptitude.perception).toBe(1);
    expect(new Set(Object.values(character.aptitudeKnown))).toEqual(new Set(['unknown']));
    expect(character.aptitudeSessions).toEqual({});
  });

  it('keeps genin where the old rule had them when people get real stats', () => {
    const game = veteran(newGame(), 10);
    const generated = game.people.generated.map(
      ({ rank: _r, stats: _s, aptitude: _a, ...old }) => old,
    );
    const { progress: _p, ...oldPeople } = game.people;
    const raw = { ...game, people: { ...oldPeople, generated } };
    const loaded = deserialize(JSON.stringify({ version: 18, state: raw }));
    if (!loaded.ok) throw new Error(loaded.error);
    const { people } = loaded.value;
    const [mate] = people.generated;
    const specialty = mate?.specialty ?? 'taijutsu';
    // The old rule: 5, plus 0.4 a mission completed; +4 in the specialty, +1 in body stats.
    expect(mate?.stats[specialty]).toBeCloseTo(13);
    expect(mate?.stats.stamina).toBe(10);
    expect(mate?.rank).toBe('genin');
    expect(mate?.aptitude).toBeDefined();
    expect(people.progress.kaen?.stats.ninjutsu).toBeCloseTo(13);
    expect(people.progress.kaen?.lastGrownDay).toBe(game.time.day - 1);
    expect(people.progress.goran).toBeUndefined();
  });

  it('rejects corrupted data', () => {
    expect(deserialize('{not json').ok).toBe(false);
    expect(deserialize(JSON.stringify({ version: 1, state: {} })).ok).toBe(false);
  });

  it('rejects saves from a newer version', () => {
    const raw = JSON.stringify({ version: SAVE_VERSION + 1, state: newGame() });
    expect(deserialize(raw)).toEqual({
      ok: false,
      error: 'This save is from a newer version of the game.',
    });
  });
});
