/** The permits step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** v30 → v31: your sensei can sign slips (the library permit); none signed yet. */
export function v30ToV31(state: RawState): RawState {
  return { ...state, people: { permits: [], ...asRecord(state.people) } };
}
