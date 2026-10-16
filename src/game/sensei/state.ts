import type { ClassRegard } from '@/content';
import type { ModifierSpec } from '@/systems/modifiers';
import { CLASS_STANDINGS, type ClassStanding } from '@/systems/profile';
import type { StatId, Stats } from '@/systems/stats';
import { DISCIPLINES } from '@/systems/techniques';

/**
 * The mentor slice of GameState: how your sensei rates you and how this week's planned
 * meetings went (`docs/design/sensei-plan.md`). Regard is their judgement of you, apart from
 * how much they like you (the bond): kept sessions raise it, skipped ones lower it, and the
 * exam nomination reads it.
 */

/** How a planned meeting went. Excused: you were on a job, away or laid up. */
export type MeetingOutcome = 'kept' | 'missed' | 'excused';

export interface Mentor {
  /** 0–100. */
  readonly regard: number;
  /** The last day whose planned meetings have been settled. */
  readonly settledDay: number;
  /** This week's planned meetings that are over, keyed by day. */
  readonly outcomes: Readonly<Record<string, MeetingOutcome>>;
  /** What would have helped, from the last job you were beaten on, until the next lesson. */
  readonly lastBeaten: string | null;
  /** The first meeting (their test, then how much you want shown) while it is on. */
  readonly opening: OpeningRun | null;
  /** Whether they walk you through the game (`on`) or you told them you know it. */
  readonly curriculum: 'on' | 'skipped';
  /** Curriculum beats they have shown you (`CurriculumBeatId`s). */
  readonly beats: readonly string[];
  /** The day they last showed you one: one a day. */
  readonly lastBeatDay: number | null;
  /** The job they picked for the team, once you have taken it. */
  readonly pickTaken: string | null;
  /** The week you did the job they picked for the team (one a week). */
  readonly pickKept: number | null;
}

/** Where the first meeting stands: the round, and what came of the last one. */
export interface OpeningRun {
  readonly round: number;
  readonly lastResult: string | null;
}

/**
 * The work your sensei set at the last lesson: a stat to raise to a mark by the next one. It
 * lives on the character, because while it is open it is a `ModifierSpec` like a meal's.
 */
export interface Assignment {
  readonly stat: StatId;
  /** Where it stood when they set it, and where they want it by the next lesson. */
  readonly from: number;
  readonly target: number;
}

/**
 * Growth on the assigned stat while the assignment is open: they're watching it. Only off
 * your best art: work there you would do anyway, and the push is where you wouldn't go.
 */
export const ASSIGNMENT_GROWTH = 1.2;

export function assignmentSpec(assignment: Assignment | null, stats: Stats): ModifierSpec {
  if (!assignment || assignment.stat === bestArt(stats)) return {};
  return { growth: { [assignment.stat]: ASSIGNMENT_GROWTH } };
}

/** Your best art. */
export function bestArt(stats: Stats): StatId {
  return DISCIPLINES.reduce<StatId>(
    (best, art) => (stats[art] > stats[best] ? art : best),
    'taijutsu',
  );
}

export const MAX_REGARD = 100;
/** Where a sensei with no view of your class starts. */
export const NEUTRAL_REGARD = 50;
/** How far your class standing moves a sensei's first view of you, per step from the middle. */
const REGARD_PER_STANDING = 5;

export const NO_MENTOR: Mentor = {
  regard: NEUTRAL_REGARD,
  settledDay: 0,
  outcomes: {},
  lastBeaten: null,
  opening: null,
  curriculum: 'on',
  beats: [],
  lastBeatDay: null,
  pickTaken: null,
  pickKept: null,
};

/**
 * A sensei's first view of you: one who champions the dead last starts warmer the lower you
 * stood, one who pushes the best the higher, and an even one doesn't care.
 */
export function startingRegard(classRegard: ClassRegard, standing: ClassStanding): number {
  const middle = (CLASS_STANDINGS.length - 1) / 2;
  const steps = CLASS_STANDINGS.indexOf(standing) - middle;
  switch (classRegard) {
    case 'champions-last':
      return NEUTRAL_REGARD - steps * REGARD_PER_STANDING;
    case 'pushes-best':
      return NEUTRAL_REGARD + steps * REGARD_PER_STANDING;
    case 'even':
      return NEUTRAL_REGARD;
  }
}

/**
 * As high as turning up alone can take their view of you: below "Proud of you". Past it, only
 * what you do counts (the work they set done, the job they picked, how you met their test).
 */
export const ATTENDANCE_CEILING = 75;

export function withRegard(mentor: Mentor, delta: number): Mentor {
  return { ...mentor, regard: Math.max(0, Math.min(MAX_REGARD, mentor.regard + delta)) };
}

/** Regard for showing up: it rises only to `ATTENDANCE_CEILING`, and never lowers it. */
export function withAttendance(mentor: Mentor, delta: number): Mentor {
  const ceiling = Math.max(mentor.regard, ATTENDANCE_CEILING);
  return { ...mentor, regard: Math.min(ceiling, mentor.regard + delta) };
}

/** Regard in words, as your sensei's manner shows it. */
export function regardWord(regard: number): string {
  if (regard < 20) return 'Doubts you';
  if (regard < 40) return 'Unconvinced';
  if (regard < 60) return 'Watching you';
  if (regard < 80) return 'Rates you';
  return 'Proud of you';
}
