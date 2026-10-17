import type { Rng } from '@/core';
import { STAT_GRADES, statTier, type StatId, type Stats } from '@/systems/stats';

import type { RaceMove, RaceRun, Stakes, Temperament } from './state';

/**
 * A race with your rival: three legs, each read against what it asks of the body, and on each
 * a choice. A push gains ground and tells on every leg after; a gamble (a shortcut over the
 * roofs) wins a lot or loses a lot at even odds; steady runs as you are, and steady behind a
 * pusher sits in their wake, so their push gains them nothing. Each answers another: steady
 * beats a push, a push beats a gamble, a gamble beats steady (on average). They choose too, as
 * each leg begins, and a sharp eye (your perception against theirs) reads what they mean to do,
 * so the right move is the one that answers theirs, not your best stat three times.
 */

export interface RaceLeg {
  readonly name: string;
  readonly course: string;
  /** What the leg asks of a runner. */
  readonly stats: readonly StatId[];
}

export const RACE_LEGS: readonly RaceLeg[] = [
  {
    name: 'The start',
    course: 'From the gate of the training ground, down to the river path.',
    stats: ['speed'],
  },
  {
    name: 'The long stretch',
    course: 'Along the river and up the shrine steps, all four hundred of them.',
    stats: ['stamina'],
  },
  {
    name: 'The finish',
    course: 'Across the rooftops to the bell tower, on whatever is left.',
    stats: ['speed', 'willpower'],
  },
];

/** How much ground a stat edge is worth on a leg: the gap as a share of the pair's average. */
const EDGE_SCALE = 6;
const PUSH_GAIN = 2.5;
/** What each leg already pushed costs on every leg after it. */
const STRAIN_COST = 1;
export const GAMBLE_ODDS = 0.5;
const GAMBLE_WIN = 4;
const GAMBLE_LOSS = 3;
/** What being rattled costs them on every leg. */
const RATTLED_COST = 1;
/** Inside this margin the finish is a dead heat. */
const DEAD_HEAT = 0.5;
/** A sharp eye always reads them; a duller one still catches a tell this often. */
const LUCKY_READ = 0.3;

export function legRating(stats: Stats, leg: RaceLeg): number {
  return leg.stats.reduce((sum, id) => sum + stats[id], 0) / leg.stats.length;
}

/** Ground a stat edge is worth on this leg (positive: yours). */
export function legEdge(yours: Stats, theirs: Stats, leg: RaceLeg): number {
  const a = legRating(yours, leg);
  const b = legRating(theirs, leg);
  return ((a - b) / Math.max(1, (a + b) / 2)) * EDGE_SCALE;
}

/** Ground the whole course is worth to you before anyone chooses anything (positive: yours). */
export function courseEdge(yours: Stats, theirs: Stats): number {
  return RACE_LEGS.reduce((sum, leg) => sum + legEdge(yours, theirs, leg), 0);
}

/** How often a temperament reaches for each move when the race is close. */
const HABIT: Readonly<Record<Temperament, Readonly<Record<RaceMove, number>>>> = {
  proud: { steady: 0.3, push: 0.5, gamble: 0.2 },
  kind: { steady: 0.5, push: 0.35, gamble: 0.15 },
  cold: { steady: 0.6, push: 0.3, gamble: 0.1 },
};

/**
 * What they mean to do on this leg: by habit while it's close; anyone well behind on the last
 * leg throws everything at it, and anyone well clear holds steady. Rattled, they gamble more.
 */
export function theirMoveFor(
  race: Pick<RaceRun, 'leg' | 'margin'>,
  temperament: Temperament,
  rattled: boolean,
  rng: Rng,
): RaceMove {
  const last = race.leg === RACE_LEGS.length - 1;
  if (last && race.margin > GAMBLE_WIN - 1) return 'gamble';
  if (race.margin < -GAMBLE_WIN) return 'steady';
  const habit = HABIT[temperament];
  const gamble = rattled ? habit.gamble * 2 : habit.gamble;
  const roll = rng.next() * (habit.steady + habit.push + gamble);
  if (roll < habit.steady) return 'steady';
  return roll < habit.steady + habit.push ? 'push' : 'gamble';
}

/** Whether you read them this leg: always with eyes at least as sharp, else sometimes. */
export function readsThem(yours: Stats, theirs: Stats, rng: Rng): boolean {
  const grade = (s: Stats) => STAT_GRADES.indexOf(statTier(s.perception).grade);
  return grade(yours) >= grade(theirs) || rng.chance(LUCKY_READ);
}

export interface LegResult {
  /** Ground you made on the leg (negative: lost). */
  readonly gained: number;
  readonly yourGamble: boolean | null;
  readonly theirGamble: boolean | null;
}

function moveGround(
  move: RaceMove,
  strain: number,
  rng: Rng,
): { ground: number; won: boolean | null } {
  const tired = strain * STRAIN_COST;
  if (move === 'push') return { ground: PUSH_GAIN - tired, won: null };
  if (move === 'steady') return { ground: -tired, won: null };
  const won = rng.chance(GAMBLE_ODDS);
  return { ground: (won ? GAMBLE_WIN : -GAMBLE_LOSS) - tired, won };
}

export interface LegInput {
  readonly race: RaceRun;
  readonly yourMove: RaceMove;
  readonly edge: number;
  readonly rattled: boolean;
}

/** A push run with someone steady at your heels gains nothing: they ride your wake. */
function wake(pusher: RaceMove, other: RaceMove): number {
  return pusher === 'push' && other === 'steady' ? PUSH_GAIN : 0;
}

export function runLeg(input: LegInput, rng: Rng): LegResult {
  const { race, yourMove, edge, rattled } = input;
  const theirMove = race.theirMove;
  const you = moveGround(yourMove, race.yourStrain, rng);
  const them = moveGround(theirMove, race.theirStrain, rng);
  const yours = you.ground - wake(yourMove, theirMove);
  const theirs = them.ground - wake(theirMove, yourMove);
  return {
    gained: edge + yours - theirs + (rattled ? RATTLED_COST : 0),
    yourGamble: you.won,
    theirGamble: them.won,
  };
}

export type Finish = 'won' | 'lost' | 'tie';

export function finishOf(margin: number): Finish {
  if (margin > DEAD_HEAT) return 'won';
  return margin < -DEAD_HEAT ? 'lost' : 'tie';
}

/** Where you stand, in words: never a number in the story. */
export function marginWords(margin: number, name: string): string {
  if (margin > 4) return `You are well clear of ${name}.`;
  if (margin > 1.5) return `You have a length on ${name}.`;
  if (margin > DEAD_HEAT) return `You are a stride ahead of ${name}.`;
  if (margin >= -DEAD_HEAT) return `You and ${name} are shoulder to shoulder.`;
  if (margin >= -1.5) return `${name} is a stride ahead.`;
  return margin >= -4 ? `${name} has a length on you.` : `${name} is well clear of you.`;
}

export function newRace(stakes: Stakes, next: Pick<RaceRun, 'theirMove' | 'read'>): RaceRun {
  return { leg: 0, margin: 0, stakes, ...next, yourStrain: 0, theirStrain: 0, told: [] };
}
