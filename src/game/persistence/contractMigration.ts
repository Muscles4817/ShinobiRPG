/** The summoning contracts' step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/**
 * v55 → v56: summoning contracts arrive. Nobody holds one yet. Contracts and the telling memory
 * both first shipped as v55, so a v55 save may have either: keep what it has, add what it lacks.
 */
export function v55ToV56(state: RawState): RawState {
  return { told: {}, ...state, contract: state.contract ?? null };
}
