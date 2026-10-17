/** The rival's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/** v44 → v45: a rival from the year. An older save has none yet; one is chosen as play goes on. */
export function v44ToV45(state: RawState): RawState {
  return { ...state, rival: state.rival ?? null };
}
