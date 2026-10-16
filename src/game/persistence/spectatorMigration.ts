/** The exam spectators' step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** v42 → v43: exam finals can be watched from the stands. Nobody has watched one yet. */
export function v42ToV43(state: RawState): RawState {
  return {
    ...state,
    exams: { ...asRecord(state.exams), watchedDay: null, spectating: false },
  };
}
