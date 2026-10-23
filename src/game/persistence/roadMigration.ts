/** The road's memory, a step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** v68 → v69: the road remembers what it brought. Nothing yet. */
export function v68ToV69(state: RawState): RawState {
  const atlas = asRecord(state.atlas);
  return {
    ...state,
    atlas: {
      ...atlas,
      recentRoad: Array.isArray(atlas.recentRoad) ? atlas.recentRoad : [],
      roadSeen: Array.isArray(atlas.roadSeen) ? atlas.roadSeen : [],
    },
  };
}
