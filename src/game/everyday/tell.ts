import { noteTold, toldBefore, type Told } from '@/systems/telling';
import { seasonOf, slotName, type Season, type TimeSlot } from '@/systems/time';
import { isHungry } from '@/systems/vitals';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { tellAmong } from '../telling';
import { festivalToday } from '../village';

/**
 * The words for an everyday action (a drill, a nap, a meal, a night's sleep): a line from the
 * action's bank that fits the moment (the hour, the season, a festival, an empty stomach, a
 * first time or an again) and that the player hasn't just read. Picks hash the save's seed and
 * the moment, never the Rng, and are remembered in the `told` slice.
 */

export type MomentTag = TimeSlot | Lowercase<Season> | 'festival' | 'hungry' | 'first' | 'again';

export interface DailyLine {
  readonly text: string;
  /** The moment this line belongs to; a line without one fits any moment but a first time. */
  readonly when?: MomentTag;
}

export interface DailyBank {
  /** Keys the bank's memory in the `told` slice. */
  readonly name: string;
  readonly lines: readonly DailyLine[];
  /** Moments that, when they hold, are said in place of anything else (a first time, hunger). */
  readonly prefer?: readonly MomentTag[];
}

export interface Occasion {
  /** What this time is, for the hash (an id, a stake). */
  readonly key: string;
  /** A marker for this action on this thing (a drill, a dish): the first time it is told. */
  readonly firstOf?: string;
}

export interface DailyTelling {
  readonly text: string;
  readonly told: Told;
}

/** The moment's tags: the hour, the season, a festival, hunger. */
export function momentTags(state: GameState, ctx: GameContext): Set<MomentTag> {
  const tags = new Set<MomentTag>([
    slotName(state.time),
    seasonOf(state.time.day).toLowerCase() as Lowercase<Season>,
  ]);
  if (festivalToday(state, ctx)) tags.add('festival');
  if (isHungry(state.character.vitals)) tags.add('hungry');
  return tags;
}

function fitsFor(bank: DailyBank, tags: ReadonlySet<MomentTag>): (line: DailyLine) => boolean {
  const first = (bank.prefer ?? []).find(
    (tag) => tags.has(tag) && bank.lines.some((line) => line.when === tag),
  );
  if (first) return (line) => line.when === first;
  return (line) => line.when === undefined || (line.when !== 'first' && tags.has(line.when));
}

/** A fresh line from the bank for this moment, and the memory with it noted. */
export function tellDaily(
  state: GameState,
  ctx: GameContext,
  bank: DailyBank,
  occasion: Occasion,
): DailyTelling {
  const tags = momentTags(state, ctx);
  const marker = occasion.firstOf;
  if (marker !== undefined) tags.add(toldBefore(state.told, marker) ? 'again' : 'first');
  const { time } = state;
  const key = `${state.board.seed}|${time.day}|${time.slot}|${occasion.key}`;
  const telling = tellAmong(state.told, bank, key, fitsFor(bank, tags));
  const told =
    marker === undefined ? telling.told : noteTold(telling.told, marker, { index: 0, size: 1 });
  return { text: telling.line.text, told };
}
