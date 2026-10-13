/**
 * v25 → v26: the animations setting arrives. Every existing save starts with animations on, as
 * a new game does.
 */
type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

export function v25ToV26(state: RawState): RawState {
  return { ...state, settings: { ...asRecord(state.settings), animations: true } };
}
