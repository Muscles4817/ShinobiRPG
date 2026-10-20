/** The hive's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/**
 * v59 → v60: hives arrive. Nobody holds one in the save yet; a child of a hive clan is given
 * theirs, full, the first time a day passes (`hives/keeping.ts`).
 */
export function v59ToV60(state: RawState): RawState {
  return { ...state, hive: null };
}

/** v60 → v61: hive rites arrive (`hives/rite.ts`). Nobody knows one yet. */
export function v60ToV61(state: RawState): RawState {
  return { ...state, rites: [] };
}

/**
 * v61 → v62: commanded dust arrives. Nobody carries a store in the save yet; a child of a dust
 * clan is given theirs, full, the first time a day passes (`dust/keeping.ts`).
 */
export function v61ToV62(state: RawState): RawState {
  return { ...state, dust: null };
}
