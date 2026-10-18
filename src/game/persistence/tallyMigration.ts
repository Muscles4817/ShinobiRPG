/** The village tallies' step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** v53 → v54: the village keeps tallies across jobs. Nothing was counted before. */
export function v53ToV54(state: RawState): RawState {
  return { ...state, village: { tallies: {}, ...asRecord(state.village) } };
}
