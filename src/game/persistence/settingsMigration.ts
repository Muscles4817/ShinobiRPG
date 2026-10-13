/**
 * Presentation slices of the save. v25 → v26: the animations setting arrives; every existing
 * save starts with animations on, as a new game does.
 */
type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

export function v25ToV26(state: RawState): RawState {
  return { ...state, settings: { ...asRecord(state.settings), animations: true } };
}

/** v26 → v27: a finished fight is kept for the watch screen. No save has one waiting. */
export function v26ToV27(state: RawState): RawState {
  return { ...state, combatFinale: null };
}
