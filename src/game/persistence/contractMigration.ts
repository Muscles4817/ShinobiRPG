/** The summoning contracts' step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/** v54 → v55: summoning contracts arrive. Nobody holds one yet. */
export function v54ToV55(state: RawState): RawState {
  return { ...state, contract: null };
}
