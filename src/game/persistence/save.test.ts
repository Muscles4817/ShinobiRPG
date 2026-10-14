import { cookingGrade } from '@/systems/cooking';
import { SOLO } from '@/systems/missions';
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

  it('a save made mid-mission at what was a fight steps into its encounter', () => {
    // Before encounters, this stage was a plain fight: the run has no encounter state yet.
    let state = act(newGame({ standing: { ...newGame().standing, missionsCompleted: 5 } }), {
      type: 'startMission',
      missionId: 'tea-merchant-escort',
    });
    state = act(state, { type: 'missionContinue' });
    state = act(state, { type: 'missionChoose', approachIndex: 0 });
    const saved = JSON.parse(serialize(state)) as { version: number };
    expect(saved.version).toBe(SAVE_VERSION);
    const loaded = deserialize(JSON.stringify(saved));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.mission?.encounter).toBeUndefined();
    const met = act(loaded.value, { type: 'missionContinue' });
    expect(met.mission?.encounter?.alertness).toBe('unaware');
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
    // All Cs on the card, so the later grade-pace step leaves the arts as this one made them.
    const grades = { taijutsu: 'C', ninjutsu: 'C', genjutsu: 'C', kenjutsu: 'C', fuuinjutsu: 'C' };
    const hardWorker = { ...old, grades, clanId: 'kurogane', talentId: 'hard-worker' };
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

  it('keeps techniques known before ranks, the ones above your grade unstable', () => {
    const game = newGame();
    const known = [...game.techniques.known, 'crescent-drop', 'ember-breath'];
    const { unstable: _u, ...oldBook } = { ...game.techniques, known };
    const raw = JSON.stringify({ version: 19, state: { ...game, techniques: oldBook } });
    const loaded = deserialize(raw);
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.techniques.known).toEqual(known);
    // Grade E in both arts: the C and the D technique are beyond it, the starters are not.
    expect(loaded.value.techniques.unstable).toEqual(['crescent-drop', 'ember-breath']);
  });

  it('gives a save from before owned scrolls an empty scroll case', () => {
    const game = newGame();
    const { scrolls: _s, ...oldInventory } = game.inventory;
    const raw = JSON.stringify({ version: 22, state: { ...game, inventory: oldInventory } });
    const loaded = deserialize(raw);
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.inventory).toEqual({ ...oldInventory, scrolls: {} });
  });

  it('gives a save from before exams no exam, no ceremony and an empty senior record', () => {
    const game = newGame();
    const { exams: _e, ...old } = game;
    const { seniorMissionsCompleted: _s, ...oldStanding } = game.standing;
    for (const version of [23]) {
      const raw = JSON.stringify({ version, state: { ...old, standing: oldStanding } });
      const loaded = deserialize(raw);
      if (!loaded.ok) throw new Error(loaded.error);
      expect(loaded.value.exams).toEqual({ run: null, lastSatDay: null, ceremony: null });
      expect(loaded.value.standing).toEqual({ ...oldStanding, seniorMissionsCompleted: 0 });
    }
  });

  it('turns animations on for a save from before the setting', () => {
    const game = newGame();
    const { animations: _a, ...oldSettings } = game.settings;
    const raw = JSON.stringify({ version: 25, state: { ...game, settings: oldSettings } });
    const loaded = deserialize(raw);
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.settings).toEqual({ ...oldSettings, animations: true });
  });

  it('gives a save from before the watch screen no finished fight waiting', () => {
    const { combatFinale: _f, ...old } = newGame();
    const loaded = deserialize(JSON.stringify({ version: 26, state: old }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.combatFinale).toBeNull();
  });

  it('sends a job under way before crews on with your team, or alone without one', () => {
    const game = newGame();
    const run = { missionId: 'lantern-patrol', stageIndex: 0, rewardMultiplier: 1, notes: [] };
    const team = { teammateIds: ['a', 'b'], senseiOptions: [], senseiId: null };
    const withTeam = { ...game, mission: run, people: { ...game.people, team } };
    const loaded = deserialize(JSON.stringify({ version: 27, state: withTeam }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.mission?.crew).toEqual({
      kind: 'old-team',
      leaderId: null,
      memberIds: ['a', 'b'],
    });
    const teamless = { ...game, mission: run, people: { ...game.people, team: null } };
    const alone = deserialize(JSON.stringify({ version: 27, state: teamless }));
    if (!alone.ok) throw new Error(alone.error);
    expect(alone.value.mission?.crew.kind).toBe('solo');
  });

  it('gives a job under way before stories nothing to remember yet', () => {
    const game = newGame();
    const run = {
      missionId: 'lantern-patrol',
      crew: SOLO,
      stageIndex: 0,
      rewardMultiplier: 1,
      notes: [],
    };
    const loaded = deserialize(JSON.stringify({ version: 28, state: { ...game, mission: run } }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.mission).toEqual({ ...run, marks: [], threads: {}, ledger: [] });
  });

  it('gives a save from before the village remembered your jobs nothing remembered', () => {
    const game = newGame();
    const old = { ...game, village: { lastSightDay: null, lastRoundDay: null } };
    const loaded = deserialize(JSON.stringify({ version: 29, state: old }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.village).toEqual({
      lastSightDay: null,
      lastRoundDay: null,
      marks: [],
      memories: [],
      clients: {},
    });
  });

  it('gives a save from before sensei signed permits none signed', () => {
    const game = newGame();
    const { permits: _permits, ...people } = game.people;
    const loaded = deserialize(JSON.stringify({ version: 30, state: { ...game, people } }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.people.permits).toEqual([]);
  });

  it('lets a save from before recipes were learned keep every recipe it could cook', () => {
    const { cooking: _cooking, ...game } = newGame();
    const loaded = deserialize(JSON.stringify({ version: 31, state: game }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(cookingGrade(loaded.value.cooking.xp)).toBe('D');
    expect(Object.keys(loaded.value.cooking.known)).toHaveLength(10);
    expect(loaded.value.cooking.known['spicy-hot-pot']).toBe(0);
  });

  it('gives a save from before builds and upbringings a balanced frame, and keeps its growth', () => {
    const game = newGame();
    const { buildId: _b, upbringingId: _u, ...character } = game.character;
    const grades = { ...character.grades, taijutsu: 'A', genjutsu: 'D' } as const;
    const aptitude = { ...character.aptitude, taijutsu: 1, genjutsu: 1, ninjutsu: 1.6 };
    const old = { ...character, grades, aptitude };
    const raw = (clanId: string) =>
      JSON.stringify({ version: 32, state: { ...game, character: { ...old, clanId } } });
    const loaded = deserialize(raw('none'));
    if (!loaded.ok) throw new Error(loaded.error);
    const loadedCharacter = loaded.value.character;
    expect(loadedCharacter.buildId).toBe('balanced');
    expect(loadedCharacter.upbringingId).toBe('civilian');
    // The grade's old pace now lives in the talent for the art.
    expect(loadedCharacter.aptitude.taijutsu).toBe(1.25);
    expect(loadedCharacter.aptitude.genjutsu).toBe(0.85);
    expect(loadedCharacter.aptitude.ninjutsu).toBe(1.6);
    const clan = deserialize(raw('kurogane'));
    expect(clan.ok && clan.value.character.upbringingId).toBe('clan-branch');
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
