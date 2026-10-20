/** Commanded dust's steps of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/** v62 → v63: S-rank dust scrolls arrive. Nobody holds one yet. */
export function v62ToV63(state: RawState): RawState {
  return { ...state, dustScrolls: [] };
}
