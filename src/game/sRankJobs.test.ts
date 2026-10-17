import { act, ctx, newGame, postEverything, veteran, withAllStats } from '@/test/gameFixtures';

import { availability } from './board';
import type { GameState } from './state';

/** S-rank work: hunts for jōnin-grade rogues, posted only to jōnin, who lead a chūnin squad. */

function at(rank: 'chunin' | 'jonin'): GameState {
  const state = postEverything(veteran(withAllStats(newGame(), 24), 40));
  return { ...state, standing: { ...state.standing, rank, seniorMissionsCompleted: 10 } };
}

describe('S-rank jobs', () => {
  const hunt = ctx.content.missions.require('the-hollow-lantern');

  it('are posted to jōnin and never shown to a chūnin', () => {
    expect(availability(at('jonin'), ctx, hunt).kind).toBe('posted');
    expect(availability(at('chunin'), ctx, hunt).kind).toBe('absent');
  });

  it('go out with a chūnin squad behind the jōnin', () => {
    const started = act(at('jonin'), { type: 'startMission', missionId: hunt.id });
    expect(started.mission?.crew.kind).toBe('chunin-squad');
    expect(started.mission?.crew.memberIds.length).toBeGreaterThan(0);
  });
});
