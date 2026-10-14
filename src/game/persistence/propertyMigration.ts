/** The property step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** v37 → v38: houses can be bought in towns; nobody owns one yet. */
export function v37ToV38(state: RawState): RawState {
  return { ...state, housing: { owned: [], ...asRecord(state.housing) } };
}
