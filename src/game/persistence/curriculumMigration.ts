/** The first-meeting and curriculum step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/**
 * v41 → v42: senseis test new teams and show new genin the ropes. A save that has met its sensei
 * already knows its way round: no test, no curriculum. One from before the team was read out
 * meets its sensei as a new game would.
 */
export function v41ToV42(state: RawState): RawState {
  const team = asRecord(asRecord(state.people).team);
  const met = typeof team.senseiId === 'string';
  return {
    ...state,
    mentor: {
      ...asRecord(state.mentor),
      opening: null,
      curriculum: met ? 'skipped' : 'on',
      beats: [],
      lastBeatDay: null,
    },
  };
}
