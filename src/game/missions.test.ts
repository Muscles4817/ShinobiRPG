import { ok } from '@/core';
import type { CombatEngine } from '@/systems/combat';
import { act, ctx, lastEntry, newGame, veteran, withAllStats } from '@/test/gameFixtures';

import type { GameContext } from './context';
import { dispatch } from './dispatch';
import type { GameState } from './state';

function playMission(
  state: GameState,
  missionId: string,
  combatOption = 'strike',
  context = ctx,
): GameState {
  let s = act(state, { type: 'startMission', missionId }, context);
  for (let i = 0; i < 200 && (s.mission || s.combat); i++) {
    if (s.combat) s = act(s, { type: 'combatAct', optionId: combatOption }, context);
    else if (dispatch(s, { type: 'missionContinue' }, context).ok)
      s = act(s, { type: 'missionContinue' }, context);
    else s = act(s, { type: 'missionChoose', approachIndex: 0 }, context);
  }
  return s;
}

describe('missions', () => {
  it('a capable genin completes a check-only mission, is paid and gets a debrief', () => {
    const start = withAllStats(newGame(), 30);
    const end = playMission(start, 'lantern-keepers-cat');
    expect(end.mission).toBeNull();
    expect(end.wallet.ryo).toBe(start.wallet.ryo + 90);
    expect(end.standing.missionsCompleted).toBe(1);
    expect(end.reports).toEqual([
      expect.objectContaining({
        kind: 'mission-complete',
        ryo: 90,
        unlocked: ['Medicine for Kuroda Farm'],
      }),
    ]);
  });

  it('records the check as choice, roll and story', () => {
    const start = withAllStats(newGame(), 30);
    let s = act(start, { type: 'startMission', missionId: 'lantern-keepers-cat' });
    s = act(s, { type: 'missionContinue' });
    expect(s.mission?.notes.map((n) => n.kind)).toEqual(['story']);
    const done = act(s, { type: 'missionChoose', approachIndex: 0 });
    expect(done.mission).toBeNull();
  });

  it('locks missions until enough have been completed', () => {
    expect(
      dispatch(newGame(), { type: 'startMission', missionId: 'storehouse-ghost' }, ctx),
    ).toEqual({
      ok: false,
      error: 'Opens after 3 completed missions.',
    });
  });

  it('cannot train while on a mission', () => {
    const onMission = act(newGame(), { type: 'startMission', missionId: 'shrine-weeding' });
    expect(dispatch(onMission, { type: 'train', trainingId: 'lake-laps' }, ctx).ok).toBe(false);
  });

  it('a strong genin wins mission combat: fight card, then debrief', () => {
    const end = playMission(withAllStats(veteran(newGame()), 30), 'tea-merchant-escort');
    expect(end.combat).toBeNull();
    expect(end.standing.missionsCompleted).toBe(6);
    expect(end.reports.map((r) => r.kind)).toEqual(['fight', 'mission-complete']);
    const dismissed = act(act(end, { type: 'dismissReport' }), { type: 'dismissReport' });
    expect(dismissed.reports).toEqual([]);
  });

  it('losing a fight fails the mission and lands you in hospital', () => {
    const end = playMission(withAllStats(veteran(newGame()), 1), 'storehouse-ghost');
    expect(end.standing.missionsFailed).toBe(1);
    expect(end.mission).toBeNull();
    expect(end.time.slot).toBe(0);
    expect(end.reports).toEqual([
      expect.objectContaining({ kind: 'defeat', title: 'The Storehouse Ghost' }),
    ]);
    expect(lastEntry(end)?.text).toMatch(/hospital/);
  });
});

describe('combat engine boundary', () => {
  it('works with any CombatEngine implementation', () => {
    // A trivial engine that wins instantly — proves the game depends only on the contract.
    const instantWin: CombatEngine = {
      id: 'instant-win',
      start: () => ({ engineId: 'instant-win', data: { done: false } }),
      act: () => ok({ engineId: 'instant-win', data: { done: true } }),
      view: () => ({
        round: 1,
        combatants: [],
        log: [],
        options: [{ id: 'win', label: 'Win', detail: '', kind: 'basic' }],
      }),
      outcome: (state) =>
        (state.data as { done: boolean }).done
          ? { result: 'victory', rounds: 1, player: { health: 1, chakra: 0 } }
          : null,
    };
    const context: GameContext = { ...ctx, combat: instantWin };
    const weakling = withAllStats(veteran(newGame({}, context)), 1);
    const end = playMission(weakling, 'storehouse-ghost', 'win', context);
    expect(end.standing.missionsCompleted).toBe(6);
    expect(end.character.vitals.health).toBe(1);
  });
});
