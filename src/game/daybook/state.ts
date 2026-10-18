import type { Rank } from '@/systems/standing';
import type { Stats } from '@/systems/stats';

/**
 * The day's record (`docs/design/day-end-plan.md`): where you stood when the day began, and,
 * once it has ended, what changed. A day ends whenever time passes into the next morning, by a
 * bed or by pushing on through the night, so the record is a snapshot taken at dawn and compared
 * at the next one, never a log each action must remember to write.
 */

/** Where you stood as the day began. */
export interface DayStart {
  readonly day: number;
  readonly stats: Stats;
  readonly ryo: number;
  /** Bond points by person id. */
  readonly bonds: Readonly<Record<string, number>>;
  readonly regard: number;
  readonly rank: Rank;
  readonly missionsCompleted: number;
  readonly techniques: readonly string[];
  readonly recipes: readonly string[];
  readonly pantry: Readonly<Record<string, number>>;
  readonly tools: Readonly<Record<string, number>>;
  readonly gear: readonly string[];
  readonly scrolls: readonly string[];
  /** Injuries carried, as `injuryId@until`. */
  readonly injuries: readonly string[];
  readonly satiety: number;
  /** The journal's next entry id: entries from here on are the day's. */
  readonly journalFrom: number;
  /** Grades already raced to with your rival (`stat:grade`); absent before a rival. */
  readonly rivalFirsts?: readonly string[];
  /** What the field book held (`kind:id`); absent on a day begun before it. */
  readonly fieldBook?: readonly string[];
}

export const FIND_KINDS = ['ingredient', 'tool', 'gear', 'scroll', 'recipe'] as const;
export type FindKind = (typeof FIND_KINDS)[number];

export interface Find {
  readonly kind: FindKind;
  readonly id: string;
  readonly count: number;
}

export interface PurseLine {
  readonly label: string;
  /** Ryo in (positive) or out (negative). */
  readonly amount: number;
}

/** What changed over a day that has ended. Ids and numbers only: the view names them. */
export interface DayEnd {
  /** The day that ended (the first, if several passed at once). */
  readonly day: number;
  /** How many days it covers: more than one after days laid up. */
  readonly days: number;
  /** Ended in a bed; false when you pushed on through the night. */
  readonly slept: boolean;
  /** Stats that grew (or fell): where each began and ended. */
  readonly stats: Readonly<Partial<Record<keyof Stats, readonly [number, number]>>>;
  readonly learned: readonly string[];
  readonly rank: Rank | null;
  /** Titles of jobs finished. */
  readonly jobs: readonly string[];
  /** Bonds that moved: points before and after. */
  readonly bonds: Readonly<Record<string, readonly [number, number]>>;
  readonly regard: readonly [number, number] | null;
  readonly finds: readonly Find[];
  readonly purse: { readonly lines: readonly PurseLine[]; readonly left: number } | null;
  /** New injuries, by injury id. */
  readonly injuries: readonly string[];
  /** Hunger grew to a stage that costs you (satiety at the start and end). */
  readonly satiety: readonly [number, number];
  /** Grades reached first today in the race with your rival; absent when none. */
  readonly rivalFirsts?: readonly { readonly key: string; readonly who: 'you' | 'them' }[];
  /** New in the field book today (`kind:id`); absent when nothing is. */
  readonly fieldBook?: readonly string[];
}

/** What the end of a day shows: the sheet at night, a slip next morning, or nothing. */
export const DAY_END_MODES = ['full', 'brief', 'off'] as const;
export type DayEndMode = (typeof DAY_END_MODES)[number];

export interface Daybook {
  /** Null until the first action of a save made before the day's record. */
  readonly start: DayStart | null;
  /** The day that last ended, until you have looked at it. */
  readonly ended: DayEnd | null;
}

export const NO_DAYBOOK: Daybook = { start: null, ended: null };
