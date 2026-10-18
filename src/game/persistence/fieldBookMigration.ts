/** The field book's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/** v49 → v50: a field book. An older save starts it empty: nothing was written down before. */
export function v49ToV50(state: RawState): RawState {
  return {
    ...state,
    fieldBook: state.fieldBook ?? { catches: {}, finds: {}, sights: [], foes: {}, rewarded: [] },
  };
}
