/** The mentor step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** A sensei with no view of you yet starts here (`NEUTRAL_REGARD`). */
const NEUTRAL_REGARD = 50;

/**
 * v39 → v40: your sensei plans your week and keeps a view of you. Everyone starts at a neutral
 * regard, and the plan starts from today: nothing before it counts as missed.
 */
export function v39ToV40(state: RawState): RawState {
  const day = asRecord(state.time).day;
  const today = typeof day === 'number' ? day : 1;
  return {
    ...state,
    mentor: { regard: NEUTRAL_REGARD, settledDay: today - 1, outcomes: {} },
  };
}
