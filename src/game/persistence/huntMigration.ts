/** The hunt's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/** v65 → v66: a town may hunt you on its roads. Nobody is looking for you yet. */
export function v65ToV66(state: RawState): RawState {
  return { ...state, hunt: { heat: 0 } };
}
