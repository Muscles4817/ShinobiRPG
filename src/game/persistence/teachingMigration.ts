/** The teachers step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** Weeks counted from day 1 in sevens, as of save version 20, written out so it never changes. */
function weekOf(day: number): number {
  return Math.floor((day - 1) / 7);
}

/**
 * v19 → v20: the weekly lesson becomes a session with your sensei as a teacher. The day of your
 * last lesson becomes your sensei's session record for that week; no favours done yet, and no
 * job is remembered as finished (a teacher asking for one wants it done from now on).
 */
export function v19ToV20(state: RawState): RawState {
  const people = asRecord(state.people);
  const rawTeam = people.team;
  const { lastLessonDay, ...team } = asRecord(rawTeam);
  const senseiId = team.senseiId;
  const taught =
    typeof lastLessonDay === 'number' && typeof senseiId === 'string'
      ? { [senseiId]: { week: weekOf(lastLessonDay), used: 1, lastDay: lastLessonDay } }
      : {};
  return {
    ...state,
    people: {
      ...people,
      team: typeof rawTeam === 'object' && rawTeam !== null ? team : null,
      taught,
      favours: [],
    },
    board: { ...asRecord(state.board), completed: [] },
  };
}
