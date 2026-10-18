/** The hive's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/**
 * v58 → v59: hives arrive. Nobody holds one in the save yet; a child of a hive clan is given
 * theirs, full, the first time a day passes (`hives/keeping.ts`).
 */
export function v58ToV59(state: RawState): RawState {
  return { ...state, hive: null };
}
