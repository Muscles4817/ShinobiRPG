/** The telling memory's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/** v54 → v55: the game remembers the lines it said lately. Nothing was remembered before. */
export function v54ToV55(state: RawState): RawState {
  return { told: {}, ...state };
}
