import type { ClassRegard } from '@/content';
import { CLASS_STANDINGS, type ClassStanding } from '@/systems/profile';

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
}

export const MAX_REGARD = 100;
/** Where a sensei with no view of your class starts. */
export const NEUTRAL_REGARD = 50;
/** How far your class standing moves a sensei's first view of you, per step from the middle. */
const REGARD_PER_STANDING = 5;

export const NO_MENTOR: Mentor = { regard: NEUTRAL_REGARD, settledDay: 0, outcomes: {} };

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

export function withRegard(mentor: Mentor, delta: number): Mentor {
  return { ...mentor, regard: Math.max(0, Math.min(MAX_REGARD, mentor.regard + delta)) };
}

/** Regard in words, as your sensei's manner shows it. */
export function regardWord(regard: number): string {
  if (regard < 20) return 'Doubts you';
  if (regard < 40) return 'Unconvinced';
  if (regard < 60) return 'Watching you';
  if (regard < 80) return 'Rates you';
  return 'Proud of you';
}
