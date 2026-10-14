/** The permits and leave steps of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** v30 → v31: your sensei can sign slips (the library permit); none signed yet. */
export function v30ToV31(state: RawState): RawState {
  return { ...state, people: { permits: [], ...asRecord(state.people) } };
}

/** v31 → v32: leave from the village for trips of your own; no pass signed, no leave taken. */
export function v31ToV32(state: RawState): RawState {
  return { leave: { passUntil: null, season: 0, daysTaken: 0 }, ...state };
}
