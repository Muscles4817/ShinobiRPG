import { NEW_GENIN, recordMissionFailure, recordMissionSuccess } from './standing';

describe('standing', () => {
  it('tracks mission outcomes and reputation', () => {
    const s = recordMissionFailure(recordMissionSuccess(NEW_GENIN, 5), 10);
    expect(s).toMatchObject({ reputation: 0, missionsCompleted: 1, missionsFailed: 1 });
  });
});
