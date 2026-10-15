/** The assignment step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/**
 * v40 → v41: your sensei sets work at each lesson and remembers what beat you. Nothing is set
 * yet, and nothing is remembered.
 */
export function v40ToV41(state: RawState): RawState {
  return {
    ...state,
    character: { ...asRecord(state.character), assignment: null },
    mentor: { ...asRecord(state.mentor), lastBeaten: null },
  };
}
