/** The style's steps of the save migrations (see `migrations.ts`): the repertoire and chains. */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** v63 → v64: a strike plays from a repertoire of body moves; nobody has chosen theirs yet. */
export function v63ToV64(state: RawState): RawState {
  return { ...state, techniques: { ...asRecord(state.techniques), repertoire: null } };
}

/** v64 → v65: a strike may open a chain of body moves; nobody has built theirs yet. */
export function v64ToV65(state: RawState): RawState {
  return { ...state, techniques: { ...asRecord(state.techniques), chains: null } };
}
