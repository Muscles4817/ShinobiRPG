/** The leave and trips step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/**
 * v36 → v37: leave from the village for trips of your own, and friends along on them. No pass
 * signed, no leave taken, home, and nobody along.
 */
export function v36ToV37(state: RawState): RawState {
  return {
    ...state,
    leave: { passUntil: null, season: 0, daysTaken: 0, awaySince: null, ...asRecord(state.leave) },
    people: { companionId: null, ...asRecord(state.people) },
  };
}
