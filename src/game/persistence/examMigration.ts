/**
 * v24 → v25: promotion exams arrive. Nobody is sitting one or waiting on a ceremony, and no
 * B-rank job has been done yet (none was ever posted), so the senior record starts at zero.
 */
type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

export function v24ToV25(state: RawState): RawState {
  const standing = asRecord(state.standing);
  return {
    ...state,
    standing: { ...standing, seniorMissionsCompleted: 0 },
    exams: { run: null, lastSatDay: null, ceremony: null },
  };
}

/**
 * v23 → v24 is reserved for step 5.2, being built alongside; it changes nothing here, and the
 * integrator swaps in 5.2's own step if it has one.
 */
export function v23ToV24(state: RawState): RawState {
  return state;
}
