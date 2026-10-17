/** The day's record step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/**
 * v43 → v44: the day's record. An older save has none: it opens with the next action, and the
 * first day to end after that is the first one shown.
 */
export function v43ToV44(state: RawState): RawState {
  return { ...state, daybook: state.daybook ?? { start: null, ended: null } };
}
