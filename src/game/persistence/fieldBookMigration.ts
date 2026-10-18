/** The field book's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/** v52 → v53: a field book. An older save starts it empty: nothing was written down before. */
export function v52ToV53(state: RawState): RawState {
  return {
    ...state,
    fieldBook: state.fieldBook ?? { catches: {}, finds: {}, sights: [], foes: {}, rewarded: [] },
  };
}
