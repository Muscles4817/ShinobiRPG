/** The atlas's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/**
 * v67 → v68: the map you know. Every place in the packs so far is famous, so nothing a save could
 * reach goes off its map; the place it stands in is the one it has been to.
 */
export function v67ToV68(state: RawState): RawState {
  if (typeof state.atlas === 'object' && state.atlas !== null) return state;
  const here = typeof state.locationId === 'string' ? [state.locationId] : [];
  return { ...state, atlas: { known: [], visited: here } };
}
