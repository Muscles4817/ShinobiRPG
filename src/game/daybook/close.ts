import { STAT_IDS, type StatId } from '@/systems/stats';

import { fieldBookKeys } from '../fieldBook/keys';
import type { GameState } from '../state';
import { jobDoneTitle } from './jobs';
import { purseLines } from './purse';
import { injuryKey } from './open';
import type { DayEnd, DayStart, Find } from './state';

/** A stat moved by less than this did not really grow (float dust from shared formulas). */
const STAT_EPSILON = 0.005;

function grownStats(start: DayStart, state: GameState): DayEnd['stats'] {
  const now = state.character.stats;
  const moved = STAT_IDS.filter((id) => Math.abs(now[id] - start.stats[id]) >= STAT_EPSILON);
  return Object.fromEntries(
    moved.map((id): [StatId, readonly [number, number]] => [id, [start.stats[id], now[id]]]),
  );
}

function movedBonds(start: DayStart, state: GameState): DayEnd['bonds'] {
  return Object.fromEntries(
    Object.entries(state.people.bonds).flatMap(([id, bond]) => {
      const before = start.bonds[id] ?? 0;
      return bond.points === before ? [] : [[id, [before, bond.points] as const]];
    }),
  );
}

function newIds(before: readonly string[], now: readonly string[]): string[] {
  return now.filter((id) => !before.includes(id));
}

function moreOf(
  kind: 'ingredient' | 'tool',
  before: Readonly<Record<string, number>>,
  now: Readonly<Record<string, number>>,
): Find[] {
  return Object.entries(now).flatMap(([id, count]) => {
    const gained = count - (before[id] ?? 0);
    return gained > 0 ? [{ kind, id, count: gained }] : [];
  });
}

function finds(start: DayStart, state: GameState): Find[] {
  const { inventory } = state;
  const one = (kind: Find['kind']) => (id: string) => ({ kind, id, count: 1 });
  return [
    ...newIds(start.recipes, Object.keys(state.cooking.known)).map(one('recipe')),
    ...newIds(start.scrolls, Object.keys(inventory.scrolls)).map(one('scroll')),
    ...newIds(start.gear, inventory.gear).map(one('gear')),
    ...moreOf('tool', start.tools, inventory.tools),
    ...moreOf('ingredient', start.pantry, inventory.pantry),
  ];
}

function jobsDone(start: DayStart, state: GameState): string[] {
  const count = state.standing.missionsCompleted - start.missionsCompleted;
  if (count <= 0) return [];
  const titles = state.journal.entries
    .filter((e) => e.id >= start.journalFrom)
    .flatMap((e) => jobDoneTitle(e.heading) ?? []);
  return titles.slice(-count);
}

function purse(start: DayStart, state: GameState): DayEnd['purse'] {
  const change = state.wallet.ryo - start.ryo;
  const entries = state.journal.entries.filter((e) => e.id >= start.journalFrom);
  const lines = purseLines(entries, change);
  return lines.length === 0 ? null : { lines, left: state.wallet.ryo };
}

function rivalFirsts(start: DayStart, state: GameState): DayEnd['rivalFirsts'] {
  const firsts = state.rival?.firsts ?? {};
  const before = new Set(start.rivalFirsts ?? []);
  const fresh = Object.entries(firsts).flatMap(([key, who]) =>
    before.has(key) ? [] : [{ key, who }],
  );
  return fresh.length > 0 ? fresh : undefined;
}

/** New in the field book since dawn; nothing for a day begun before there was one. */
function written(start: DayStart, state: GameState): DayEnd['fieldBook'] {
  if (!start.fieldBook) return undefined;
  const fresh = newIds(start.fieldBook, fieldBookKeys(state.fieldBook));
  return fresh.length > 0 ? fresh : undefined;
}

/** What changed between `start` and now, for a day that has just ended. */
export function closeDay(start: DayStart, state: GameState, slept: boolean): DayEnd {
  const injuries = state.character.injuries.filter((i) => !start.injuries.includes(injuryKey(i)));
  const raced = rivalFirsts(start, state);
  const fieldBook = written(start, state);
  return {
    ...(raced ? { rivalFirsts: raced } : {}),
    ...(fieldBook ? { fieldBook } : {}),
    day: start.day,
    days: Math.max(1, state.time.day - start.day),
    slept,
    stats: grownStats(start, state),
    learned: newIds(start.techniques, state.techniques.known),
    rank: state.standing.rank === start.rank ? null : state.standing.rank,
    jobs: jobsDone(start, state),
    bonds: movedBonds(start, state),
    regard: state.mentor.regard === start.regard ? null : [start.regard, state.mentor.regard],
    finds: finds(start, state),
    purse: purse(start, state),
    injuries: injuries.map((i) => i.injuryId),
    satiety: [start.satiety, state.character.vitals.satiety],
  };
}
