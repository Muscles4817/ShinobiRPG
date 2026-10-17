import { hashUnit } from '@/core';
import {
  daysUnfed,
  hungerOf,
  keepsRoutine,
  laidUp,
  mended,
  PLAYER_OWNER,
  STARVING_BOND_DRIFT,
  STRAY_LEAVES_AFTER,
  withBond,
  type Companion,
} from '@/systems/companions';
import { write } from '@/systems/journal';
import {
  applyTraining,
  limitsFor,
  type Growth,
  type StatDelta,
  type StatId,
} from '@/systems/stats';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { kindOf, maxHealthOf } from './make';

/**
 * A companion's days, lived as each morning comes (caught up lazily like peers', from a hash of
 * the seed, never the game's dice). Its own routine (running, sniffing about, a scuffle now and
 * then) is light work that keeps it from falling behind; training together is how it gets
 * strong. Each night mends it; a hungry one skips its routine, a starving one drifts from you,
 * and a stray starved long enough goes back to the streets. On the road it eats from your pack.
 */

/** After a long gap, only this many days are caught up. */
const MAX_CATCH_UP_DAYS = 60;
/** A day in this many it just lies about. */
const IDLE_DAY_CHANCE = 0.25;
/** What a day's routine works, before talent and limits. */
const ROUTINE: Readonly<Partial<Record<StatId, number>>> = {
  speed: 0.4,
  perception: 0.4,
  stamina: 0.3,
  taijutsu: 0.3,
};
/** Days unfed after which a stray counts its starving days towards leaving. */
const STARVING_FROM = 3;

function routineOn(companion: Companion, seed: number, day: number): StatDelta {
  return hashUnit(seed, day, companion.id, 'idle') < IDLE_DAY_CHANCE ? {} : ROUTINE;
}

/** How a companion grows: its talent, within the limits that talent sets. */
export function companionGrowth(companion: Companion): Growth {
  return { scale: companion.aptitude, limits: limitsFor(companion.aptitude) };
}

interface DayContext {
  readonly seed: number;
  readonly maxHealth: number;
  /** On a job or the road: it eats from your pack at camp. */
  readonly onTheRoad: boolean;
}

/** One day lived, ending the night before `day + 1`. */
function lived(
  today: Companion,
  day: number,
  { seed, maxHealth, onTheRoad }: DayContext,
): Companion {
  const companion = onTheRoad ? { ...today, lastFedDay: day } : today;
  const hunger = hungerOf(companion, day);
  const stats = keepsRoutine(hunger, laidUp(companion, day))
    ? applyTraining(companion.stats, routineOn(companion, seed, day), companionGrowth(companion))
    : companion.stats;
  const healed = companion.injury && companion.injury.until <= day + 1 ? null : companion.injury;
  const rested = {
    ...companion,
    stats,
    health: mended(companion.health, maxHealth, 1),
    injury: healed,
  };
  return hunger === 'starving' ? withBond(rested, -STARVING_BOND_DRIFT) : rested;
}

/** Whether a stray has starved long enough to go back to the streets. */
function wandersOff(companion: Companion, today: number, stray: boolean): boolean {
  return stray && daysUnfed(companion, today) >= STARVING_FROM + STRAY_LEAVES_AFTER;
}

function leaves(state: GameState, companion: Companion): GameState {
  const { [PLAYER_OWNER]: _gone, ...owned } = state.companions.owned;
  const companions = {
    ...state.companions,
    owned,
    strayed: companion,
    befriending: { kindId: companion.kindId, visits: 0, lastVisitDay: state.time.day - 1 },
  };
  // Written to the journal directly: this runs inside `spendTime`, which `ops` owns.
  const journal = write(state.journal, state.time, {
    heading: `${companion.name} is gone`,
    text: `Days without a meal were too many. ${companion.name} has gone back to the streets. Strays come back to those who feed them.`,
    tone: 'warning',
  });
  return { ...state, companions, journal };
}

/**
 * Your companion as of this morning: every day that has ended since it was last caught up is
 * lived. Returns the same state when nothing changed.
 */
export function companionsDayPassed(state: GameState, ctx: GameContext): GameState {
  const through = state.time.day - 1;
  const companion = state.companions.owned[PLAYER_OWNER];
  if (!companion || companion.lastGrownDay >= through) return state;
  const kind = kindOf(companion, ctx);
  const days = {
    seed: state.board.seed,
    maxHealth: maxHealthOf(kind),
    onTheRoad: state.mission !== null,
  };
  let now: Companion = companion;
  const first = Math.max(companion.lastGrownDay + 1, through - MAX_CATCH_UP_DAYS + 1);
  for (let day = first; day <= through; day++) now = lived(now, day, days);
  now = { ...now, lastGrownDay: through };
  if (wandersOff(now, state.time.day, kind.temperament === 'stray')) return leaves(state, now);
  const owned = { ...state.companions.owned, [PLAYER_OWNER]: now };
  return { ...state, companions: { ...state.companions, owned } };
}
