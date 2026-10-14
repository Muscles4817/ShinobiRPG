/** The chakra paper step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** v35 → v36: natures are found with chakra paper. Characters made before chose theirs, so they know it. */
export function v35ToV36(state: RawState): RawState {
  return { ...state, character: { ...asRecord(state.character), natureKnown: true } };
}
