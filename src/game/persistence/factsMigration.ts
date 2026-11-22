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
 * How a v74 debrief told a line was yours: it opened on a past tense. Frozen here as it was, so
 * the lines already written on a job under way read as they did; never shared with live code.
 */
const V74_IRREGULAR = new Set(
  (
    'beat bit bought broke brought caught chose came did drew dug fell felt fought found gave ' +
    'got had heard held hid hung kept knew laid led left let lost made meant met paid ran read ' +
    'rode said sat saw sent set shut slept sold spoke split stood stole struck swore taught ' +
    'thought threw told took was went woke won wore wrote'
  ).split(' '),
);
const V74_NOT_VERBS = new Set(['need', 'seed', 'speed', 'bleed', 'breed', 'shed', 'sled', 'embed']);

function v74Yours(text: string): boolean {
  const first = /^[A-Za-z-]+/.exec(text.trim())?.[0] ?? '';
  if (first !== first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()) return false;
  const word = first.toLowerCase();
  return V74_IRREGULAR.has(word) || (/^[a-z-]{2,}ed$/.test(word) && !V74_NOT_VERBS.has(word));
}

/**
 * A job under way keeps the lines it has written: each now says whose it is (as v74 read it)
 * and whether it was a setback (as v74 graded it: a line told as a cost).
 */
function ledgerLine(value: unknown): RawState {
  const line = record(value);
  const text = typeof line.text === 'string' ? line.text : '';
  return {
    ...line,
    ...(v74Yours(text) ? {} : { subject: 'its-own' }),
    ...(line.tone === 'cost' ? { setback: true } : {}),
  };
}

function mission(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  const run = record(value);
  return { ...run, ledger: list(run.ledger).map(ledgerLine) };
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
 * the day's record reads the facts. A save from before has none recorded yet, so a meeting
 * earlier on the day it is loaded has no slots at hand to judge it by and is excused: lenient,
 * once, rather than marking a miss nobody saw.
 */
export function v74ToV75(state: RawState): RawState {
  return {
    ...state,
    facts: [],
    character: numbered(record(state.character)),
    housing: { ...record(state.housing), givers: givers(record(state.people)) },
    board: { ...record(state.board), upcoming: null },
    daybook: daybook(state.daybook),
    mission: mission(state.mission),
  };
}
