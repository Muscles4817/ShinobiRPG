import { act, newGame } from '@/test/gameFixtures';

import { deserialize, SAVE_VERSION, serialize } from './persistence';

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
