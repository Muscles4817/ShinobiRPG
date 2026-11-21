/** The promotion day's and the doorstep's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function record(value: unknown): RawState {
  // A save's slices are plain objects; anything else is read as empty.
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/**
 * v73 → v74: the village sets a day for its promotions, and a friend's gift may wait at your
 * door. A save from before has neither waiting.
 */
export function v73ToV74(state: RawState): RawState {
  return {
    ...state,
    exams: { ...record(state.exams), promotionDay: null },
    housing: { ...record(state.housing), doorstep: [] },
  };
}
