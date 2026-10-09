import { act, newGame } from '@/test/gameFixtures';

import { deserialize, SAVE_VERSION, serialize } from './save';

describe('persistence', () => {
  it('round-trips a game, including an in-progress fight', () => {
    let state = act(newGame({ standing: { ...newGame().standing, missionsCompleted: 5 } }), {
      type: 'startMission',
      missionId: 'tea-merchant-escort',
    });
    state = act(state, { type: 'missionContinue' });
    state = act(state, { type: 'missionChoose', approachIndex: 0 });
    state = act(state, { type: 'missionContinue' });
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
