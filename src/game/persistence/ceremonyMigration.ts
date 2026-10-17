/** The promotion routes' step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/**
 * v47 → v48: a ceremony says which route earned it. One already waiting was earned the only
 * ways there were: a chūnin's by the exam, a jōnin's by nomination.
 */
export function v47ToV48(state: RawState): RawState {
  const exams = asRecord(state.exams);
  const ceremony = exams.ceremony;
  if (ceremony === null || ceremony === undefined) return state;
  const rank = asRecord(ceremony).rank;
  const route = rank === 'jonin' ? 'nomination' : 'exam';
  return { ...state, exams: { ...exams, ceremony: { ...asRecord(ceremony), route } } };
}
