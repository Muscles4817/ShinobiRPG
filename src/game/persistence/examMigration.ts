/**
 * v23 → v24: promotion exams arrive. Nobody is sitting one or waiting on a ceremony. The senior
 * record (B-rank and harder jobs, for a jōnin's nomination) starts at zero: jobs done as a genin
 * before it existed were never counted, and a genin is years from a jōnin's record anyway.
 */
type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

export function v23ToV24(state: RawState): RawState {
  const standing = asRecord(state.standing);
  return {
    ...state,
    standing: { ...standing, seniorMissionsCompleted: 0 },
    exams: { run: null, lastSatDay: null, ceremony: null },
  };
}
