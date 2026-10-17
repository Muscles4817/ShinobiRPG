/**
 * Your rival (`docs/design/rival-plan.md`): one classmate the year sets against you. What the
 * save keeps: who, the shape of the gap between you and their temperament (both read once,
 * when they are chosen), the heat between you, the tally, who reached each grade first, and
 * any challenge or reply waiting.
 */

/** How the gap between you lies: rolled from the year, never quietly evened out. */
export const RIVAL_SHAPES = ['prodigy', 'neck', 'chaser', 'fallen'] as const;
export type RivalShape = (typeof RIVAL_SHAPES)[number];

/** How they carry it, read from their traits. */
export const TEMPERAMENTS = ['proud', 'kind', 'cold'] as const;
export type Temperament = (typeof TEMPERAMENTS)[number];

/** Heat runs 0 (bitter) to 100 (sworn); each quarter is a stage. */
export const HEAT_STAGES = ['Bitter', 'Grudging', 'Respect', 'Sworn'] as const;
export const MAX_HEAT = 100;

/** Who has the better of it: you, or them. */
export interface Score {
  readonly you: number;
  readonly them: number;
}

/** A moment waiting for your answer: meeting them, the words after a contest, or a provocation. */
export type RivalBeat =
  | { readonly kind: 'meeting' }
  | { readonly kind: 'after-spar'; readonly won: boolean }
  | { readonly kind: 'after-race'; readonly won: boolean }
  | { readonly kind: 'provocation'; readonly id: string };

/** The two ways to settle it: a spar (a real fight) or a race (three legs, read as you run). */
export const CONTESTS = ['spar', 'race'] as const;
export type Contest = (typeof CONTESTS)[number];

/** What rides on it: only pride, or a purse each side puts up. */
export const STAKES = ['pride', 'purse'] as const;
export type Stakes = (typeof STAKES)[number];

export interface Challenge {
  /** The day it was made; it stands until the end of the next. */
  readonly day: number;
  /** Why now, in their words. */
  readonly line: string;
  readonly contest: Contest;
}

/** How you run a leg of a race. */
export const RACE_MOVES = ['steady', 'push', 'gamble'] as const;
export type RaceMove = (typeof RACE_MOVES)[number];

/** A race under way: which leg, how far ahead you are (negative: behind), and their next move. */
export interface RaceRun {
  readonly leg: number;
  readonly margin: number;
  readonly stakes: Stakes;
  /** What they mean to do on this leg, chosen as it begins, so a sharp eye can read it. */
  readonly theirMove: RaceMove;
  /** Whether you read them this leg: rolled as it begins, so the screen and the run agree. */
  readonly read: boolean;
  /** Legs each of you has pushed: it tells on the next. */
  readonly yourStrain: number;
  readonly theirStrain: number;
  /** What happened on each leg so far, in words. */
  readonly told: readonly string[];
}

export interface Rival {
  readonly personId: string;
  readonly shape: RivalShape;
  readonly temperament: Temperament;
  readonly heat: number;
  readonly spars: Score;
  readonly races: Score;
  /** Who reached each grade first, keyed `stat:grade`, from the day they were chosen on. */
  readonly firsts: Readonly<Record<string, 'you' | 'them'>>;
  /** Grades each of you already had when chosen: not a race. */
  readonly startGrades: Readonly<Record<string, number>>;
  readonly challenge: Challenge | null;
  /** The last day they challenged you. */
  readonly lastChallengeDay: number;
  readonly beat: RivalBeat | null;
  /** The last day they needled you. */
  readonly lastProvocationDay: number;
  /** Thrown off by something you said: worse at the next contest, then over it. */
  readonly rattled: boolean;
  /** What rides on the spar under way with them, if one is. */
  readonly sparStakes: Stakes | null;
  readonly race: RaceRun | null;
}

export function heatStage(heat: number): number {
  return Math.min(HEAT_STAGES.length - 1, Math.floor(heat / (MAX_HEAT / HEAT_STAGES.length)));
}

export function clampHeat(heat: number): number {
  return Math.min(MAX_HEAT, Math.max(0, Math.round(heat)));
}

export function firstsScore(rival: Rival): Score {
  const all = Object.values(rival.firsts);
  return {
    you: all.filter((w) => w === 'you').length,
    them: all.filter((w) => w === 'them').length,
  };
}
