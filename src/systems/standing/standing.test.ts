import {
  NEW_GENIN,
  nextRank,
  promote,
  rankAtLeast,
  recordMissionFailure,
  recordMissionSuccess,
} from './standing';

describe('standing', () => {
  it('tracks mission outcomes and reputation', () => {
    const s = recordMissionFailure(recordMissionSuccess(NEW_GENIN, 5), 10);
    expect(s).toMatchObject({ reputation: 0, missionsCompleted: 1, missionsFailed: 1 });
  });

  it('counts senior jobs apart, for a jōnin’s record', () => {
    const s = recordMissionSuccess(recordMissionSuccess(NEW_GENIN, 2), 8, true);
    expect(s).toMatchObject({ missionsCompleted: 2, seniorMissionsCompleted: 1 });
  });

  it('orders ranks and promotes one at a time', () => {
    expect(rankAtLeast('chunin', 'genin')).toBe(true);
    expect(rankAtLeast('genin', 'chunin')).toBe(false);
    expect(nextRank('genin')).toBe('chunin');
    expect(nextRank('kage')).toBeNull();
    expect(promote(NEW_GENIN, 'chunin')).toMatchObject({ rank: 'chunin', missionsCompleted: 0 });
  });
});
