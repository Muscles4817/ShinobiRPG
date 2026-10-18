/** The village tallies' step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** v49 → v50: the village keeps tallies across jobs. Nothing was counted before. */
export function v49ToV50(state: RawState): RawState {
  return { ...state, village: { tallies: {}, ...asRecord(state.village) } };
}
