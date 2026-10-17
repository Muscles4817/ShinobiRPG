/** The companions' step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/**
 * v45 → v46: companions arrive. Nobody has one yet, and nobody is befriending a stray; a clan
 * child of an older save meets no pup (they grew up before companions were kept).
 */
export function v45ToV46(state: RawState): RawState {
  return { ...state, companions: { owned: {}, befriending: null } };
}
