import { WHITE_STAG } from '@/content/packs/original/jobs/whiteStag';
import { act, ctx, newGame, veteran, withAllStats } from '@/test/gameFixtures';

import type { GameState } from './state';

const LAST_SHOT = WHITE_STAG.stages.findIndex((s) => s.kind === 'check' && s.onFailure === 'abort');

/** On the job at the last poacher's shot, with the stats given. */
function atTheShot(stats: number): GameState {
  const taken = act(withAllStats(veteran(newGame(), 8), stats), {
    type: 'startMission',
    missionId: WHITE_STAG.id,
  });
  return { ...taken, mission: { ...taken.mission!, stageIndex: LAST_SHOT } };
}

/** The white stag must come through alive: the job fails if the last poacher's arrow lands. */
describe('the white stag', () => {
  it('fails the job when the stag is shot', () => {
    const after = act(atTheShot(1), { type: 'missionChoose', approachIndex: 0 }, ctx);
    expect(after.mission).toBeNull();
    expect(after.reports.at(-1)).toMatchObject({ kind: 'mission-failed', title: 'The White Stag' });
  });

  it('goes on to the ending when you get between them', () => {
    const after = act(atTheShot(40), { type: 'missionChoose', approachIndex: 0 }, ctx);
    expect(after.mission?.stageIndex).toBeGreaterThan(LAST_SHOT);
    expect(after.reports.some((r) => r.kind === 'mission-failed')).toBe(false);
  });
});
