/** The rotating talk's step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

const isRecord = (value: unknown): value is RawState =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * v57 → v58: a templated conversation keeps the facet it is about. One in progress from before
 * has none, and is read as the person's first facet of its kind, as it was then. Bonds' `heard`
 * lists keep their bare ids, read the same way (`hasHeard`).
 */
export function v57ToV58(state: RawState): RawState {
  const people = state.people;
  if (!isRecord(people)) return state;
  const conversation = people.conversation;
  if (!isRecord(conversation)) return state;
  return {
    ...state,
    people: { ...people, conversation: { topicKey: null, ...conversation } },
  };
}
