import { fillSlots, hashUnit } from '@/core';
import type { CompanionKindDef } from '@/content';
import {
  BODY_STATS,
  daysUnfed,
  growingDay,
  hungerOf,
  keepsRoutine,
  laidUp,
  mended,
  neglected,
  NEGLECT_DRIFT,
  PLAYER_OWNER,
  STARVING_BOND_DRIFT,
  STRAY_LEAVES_AFTER,
  withBond,
  type Companion,
  type LifeStage,
} from '@/systems/companions';
import { write } from '@/systems/journal';
import { applyTraining, type Growth, type StatDelta, type StatId } from '@/systems/stats';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { companionLimits, stageOfLife, withGrownBody } from './body';
import { kindOf, maxHealthOf } from './make';

/**
 * A companion's days, lived as each morning comes (caught up lazily like peers', from a hash of
 * the seed, never the game's dice). Its body grows with each day (`body.ts`), slower when hungry;
 * its own routine (sniffing about, a scuffle now and then) keeps its skills ticking over;
 * training together is how they grow. Each night mends it; a starving one drifts from you, a
 * neglected one more slowly, and a stray starved long enough goes back to the streets. On the
 * road it forages at camp, so it never goes hungry on a job.
 */

/** After a long gap, only this many days are caught up. */
const MAX_CATCH_UP_DAYS = 60;
/** A day in this many it just lies about. */
const IDLE_DAY_CHANCE = 0.25;
/** What a day's routine works, before talent and limits: skills only, the body grows itself. */
const ROUTINE: Readonly<Partial<Record<StatId, number>>> = {
  perception: 0.3,
  taijutsu: 0.3,
};
/** Days unfed after which a stray counts its starving days towards leaving. */
const STARVING_FROM = 3;

/** What it says of a companion the morning it reaches a stage of life. */
const GROWN_INTO: Readonly<Record<LifeStage, string>> = {
  pup: '{name} is still all paws and ears.',
  young:
    '{name} has grown into its paws: long in the leg now, and old enough to come with you when you fight.',
  grown: '{name} is grown. It has the body it will have; what it can do is down to training now.',
};

function routineOn(companion: Companion, seed: number, day: number): StatDelta {
  return hashUnit(seed, day, companion.id, 'idle') < IDLE_DAY_CHANCE ? {} : ROUTINE;
}

/** How a companion grows by training: its talent for skills, its body's ceiling for the rest. */
export function companionGrowth(
  companion: Companion,
  kind: CompanionKindDef,
  seed: number,
): Growth {
  return { scale: companion.aptitude, limits: companionLimits(companion, kind, seed) };
}

interface DayContext {
  readonly seed: number;
  readonly kind: CompanionKindDef;
  readonly maxHealth: number;
  /** On a job or the road: it forages at camp. */
  readonly onTheRoad: boolean;
}

function drifted(companion: Companion, day: number, starving: boolean): Companion {
  if (starving) return withBond(companion, -STARVING_BOND_DRIFT);
  return neglected(companion, day) ? withBond(companion, -NEGLECT_DRIFT) : companion;
}

/** One day lived, ending the night before `day + 1`. */
function lived(
  today: Companion,
  day: number,
  { seed, kind, maxHealth, onTheRoad }: DayContext,
): Companion {
  const companion = onTheRoad ? { ...today, lastFedDay: day } : today;
  const hunger = hungerOf(companion, day);
  const skills = keepsRoutine(hunger, laidUp(companion, day))
    ? applyTraining(
        companion.stats,
        routineOn(companion, seed, day),
        companionGrowth(companion, kind, seed),
      )
    : companion.stats;
  const grownDays = companion.grownDays + growingDay(hunger);
  const stats = withGrownBody({ ...companion, grownDays, stats: skills }, kind, seed);
  const healed = companion.injury && companion.injury.until <= day + 1 ? null : companion.injury;
  const rested = {
    ...companion,
    stats,
    grownDays,
    health: mended(companion.health, maxHealth, 1),
    injury: healed,
  };
  return drifted(rested, day, hunger === 'starving');
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

/** A line in the journal the morning it reaches a new stage of life. */
function grewUp(
  state: GameState,
  before: LifeStage,
  now: Companion,
  kind: CompanionKindDef,
): GameState {
  const stage = stageOfLife(now, kind);
  if (stage === before) return state;
  const journal = write(state.journal, state.time, {
    heading: `${now.name} is growing up`,
    text: fillSlots(GROWN_INTO[stage], { name: now.name }),
    tone: 'success',
  });
  return { ...state, journal };
}

/**
 * Its body as its age gives it, today: a companion from an older save (grown, but with the body
 * it had before bodies grew) catches up at once, not the next morning.
 */
function bodyCaughtUp(state: GameState, companion: Companion, kind: CompanionKindDef): GameState {
  const stats = withGrownBody(companion, kind, state.board.seed);
  if (BODY_STATS.every((stat) => stats[stat] === companion.stats[stat])) return state;
  const owned = { ...state.companions.owned, [PLAYER_OWNER]: { ...companion, stats } };
  return { ...state, companions: { ...state.companions, owned } };
}

/**
 * Your companion as of this morning: every day that has ended since it was last caught up is
 * lived. Returns the same state when nothing changed.
 */
export function companionsDayPassed(state: GameState, ctx: GameContext): GameState {
  const through = state.time.day - 1;
  const companion = state.companions.owned[PLAYER_OWNER];
  if (!companion) return state;
  const kind = kindOf(companion, ctx);
  if (companion.lastGrownDay >= through) return bodyCaughtUp(state, companion, kind);
  const days = {
    seed: state.board.seed,
    kind,
    maxHealth: maxHealthOf(kind),
    onTheRoad: state.mission !== null,
  };
  let now: Companion = companion;
  const first = Math.max(companion.lastGrownDay + 1, through - MAX_CATCH_UP_DAYS + 1);
  for (let day = first; day <= through; day++) now = lived(now, day, days);
  now = { ...now, lastGrownDay: through };
  if (wandersOff(now, state.time.day, kind.temperament === 'stray')) return leaves(state, now);
  const owned = { ...state.companions.owned, [PLAYER_OWNER]: now };
  const grown = { ...state, companions: { ...state.companions, owned } };
  return grewUp(grown, stageOfLife(companion, kind), now, kind);
}
