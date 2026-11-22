/** The facts' step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

/** The bond points of a close friend as this step was written (a friend there brought a gift). */
const CLOSE_FRIEND_POINTS = 55;

function record(value: unknown): RawState {
  // A save's slices are plain objects; anything else is read as empty.
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? (value as unknown[]) : [];
}

/** Each injury carried gets its own number, in the order they were taken. */
function numbered(character: RawState): RawState {
  const injuries = list(character.injuries).map((injury, i) => ({
    ...record(injury),
    instance: i + 1,
  }));
  return { ...character, injuries, woundsTaken: injuries.length };
}

/** Everyone a close friend already has brought their gift, or had it left at the door. */
function givers(people: RawState): string[] {
  return Object.entries(record(people.bonds))
    .filter(([, bond]) => {
      const points = record(bond).points;
      return typeof points === 'number' && points >= CLOSE_FRIEND_POINTS;
    })
    .map(([id]) => id);
}

/**
 * The day's record as facts: the dawn snapshot no longer keeps injuries or the jobs count, and
 * counts the facts instead. A sheet waiting to be read was written the old way and is put away.
 */
function daybook(value: unknown): RawState {
  const book = record(value);
  if (book.start === null || book.start === undefined) return { ...book, ended: null };
  const { injuries: _injuries, missionsCompleted: _done, ...start } = record(book.start);
  return { start: { ...start, factsFrom: 0 }, ended: null };
}

/**
 * v74 → v75: what happened is written down as it happens. Injuries have their own numbers, the
 * friends who gave a gift are remembered, the board decides tomorrow's jobs a day ahead, and
 * the day's record reads the facts. A save from before has none recorded yet.
 */
export function v74ToV75(state: RawState): RawState {
  return {
    ...state,
    facts: [],
    character: numbered(record(state.character)),
    housing: { ...record(state.housing), givers: givers(record(state.people)) },
    board: { ...record(state.board), upcoming: null },
    daybook: daybook(state.daybook),
  };
}
