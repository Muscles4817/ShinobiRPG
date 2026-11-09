/** The journey's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/** v66 → v67: a trip's end is kept for the map. No save has one waiting. */
export function v66ToV67(state: RawState): RawState {
  return { ...state, journeyEnd: null };
}
