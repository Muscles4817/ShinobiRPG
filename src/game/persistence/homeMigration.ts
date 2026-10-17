/** The home ladder's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/**
 * v47 → v48: a home that can be furnished and moved up from. An older save lives in the home
 * it started in, owns no furniture, has no garden and nobody staying.
 */
export function v47ToV48(state: RawState): RawState {
  // An older save, read as it was written: a trust boundary.
  const housing = state.housing as RawState;
  return {
    ...state,
    housing: {
      ...housing,
      homeId: housing.homeId ?? null,
      furniture: housing.furniture ?? [],
      placed: housing.placed ?? {},
      beds: housing.beds ?? [],
      guestId: housing.guestId ?? null,
    },
  };
}
