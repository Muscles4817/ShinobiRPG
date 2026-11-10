/** Your puppets' step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/** v70 → v71: puppets of your own arrive. Nobody owns one yet, and nobody has any craft. */
export function v70ToV71(state: RawState): RawState {
  return { ...state, puppetry: { puppets: [], craft: 0 } };
}
