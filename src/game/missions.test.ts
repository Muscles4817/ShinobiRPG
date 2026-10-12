import { ok } from '@/core';
import type { CombatEngine } from '@/systems/combat';
import { act, ctx, lastEntry, newGame, pressOn, veteran, withAllStats } from '@/test/gameFixtures';

import type { GameContext } from './context';
import { dispatch } from './dispatch';
import type { GameState } from './state';

function playMission(state: GameState, missionId: string, context = ctx): GameState {
  let s = act(state, { type: 'startMission', missionId }, context);
  for (let i = 0; i < 200 && (s.mission || s.combat); i++) s = pressOn(s, context);
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

  it('a job that ends on a check tells you how it went on the debrief and in the journal', () => {
    const strong = playMission(withAllStats(newGame(), 30), 'lantern-keepers-cat');
    const caught = 'You scoop Mochi up mid-leap. She bites you, but only a little.';
    expect(strong.reports[0]).toMatchObject({ kind: 'mission-complete', ending: caught });
    expect(lastEntry(strong)?.text).toBe(caught);
    const weak = playMission(withAllStats(newGame(), 0.5), 'lantern-keepers-cat');
    expect(weak.reports[0]).toMatchObject({
      ending: 'Mochi leads you on a two-hour chase before you finally corner her.',
    });
  });

  it('hides jobs you are not trusted with yet', () => {
    expect(
      dispatch(newGame(), { type: 'startMission', missionId: 'storehouse-ghost' }, ctx),
    ).toEqual({
      ok: false,
      error: 'That job isn’t on the board right now.',
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
    expect(end.journal.entries.some((e) => e.text.includes('hospital'))).toBe(true);
  });

  it('a defeat leaves a named injury, shown on the defeat card and in the journal', () => {
    const end = playMission(withAllStats(veteran(newGame()), 1), 'storehouse-ghost');
    expect(end.character.injuries).toHaveLength(1);
    const def = ctx.content.injuries.require(end.character.injuries[0]!.injuryId);
    expect(def.causes).toContain('defeat');
    expect(end.reports[0]).toMatchObject({ kind: 'defeat', injury: def.name });
    expect(lastEntry(end)?.heading).toBe(def.name);
    expect(lastEntry(end)?.text).not.toMatch(/\d/);
  });
});

describe('combat engine boundary', () => {
  it('works with any CombatEngine implementation', () => {
    // A trivial engine that wins instantly — proves the game depends only on the contract.
    const instantWin: CombatEngine = {
      id: 'instant-win',
      label: 'Instant win',
      summary: 'Test engine.',
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
    const context: GameContext = { ...ctx, engines: [instantWin] };
    const weakling = withAllStats(veteran(newGame({}, context)), 1);
    const end = playMission(weakling, 'storehouse-ghost', context);
    expect(end.standing.missionsCompleted).toBe(6);
    expect(end.character.vitals.health).toBe(1);
  });
});
