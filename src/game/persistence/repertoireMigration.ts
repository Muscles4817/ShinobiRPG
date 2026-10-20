/** The repertoire's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** v63 → v64: a strike plays from a repertoire of body moves; nobody has chosen theirs yet. */
export function v63ToV64(state: RawState): RawState {
  return { ...state, techniques: { ...asRecord(state.techniques), repertoire: null } };
}
