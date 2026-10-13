/**
 * v24 → v25: class standing arrives. Every character made before it stood in the middle of
 * their class, which is exactly how creation graded them (an A, a B and a D), so nothing about
 * them changes.
 */
type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

export function v24ToV25(state: RawState): RawState {
  return { ...state, character: { ...asRecord(state.character), classStanding: 'middle' } };
}
