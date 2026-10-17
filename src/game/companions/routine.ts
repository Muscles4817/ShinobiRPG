import { hashUnit } from '@/core';
import { PLAYER_OWNER, type Companion, type Companions } from '@/systems/companions';
import {
  applyTraining,
  limitsFor,
  type Growth,
  type StatDelta,
  type StatId,
} from '@/systems/stats';

import type { GameState } from '../state';

/**
 * A companion's own routine: running, sniffing about, a scuffle now and then. Light work, so
 * it keeps from falling behind but won't climb much on its own; training together is how it
 * gets strong. Days are caught up lazily like peers', from a hash of the seed, the day and the
 * companion, never the game's dice.
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

function routineOn(companion: Companion, seed: number, day: number): StatDelta {
  return hashUnit(seed, day, companion.id, 'idle') < IDLE_DAY_CHANCE ? {} : ROUTINE;
}

/** How a companion grows: its talent, within the limits that talent sets. */
function companionGrowth(companion: Companion): Growth {
  return { scale: companion.aptitude, limits: limitsFor(companion.aptitude) };
}

function caughtUp(companion: Companion, seed: number, through: number): Companion {
  const growth = companionGrowth(companion);
  let stats = companion.stats;
  const first = Math.max(companion.lastGrownDay + 1, through - MAX_CATCH_UP_DAYS + 1);
  for (let day = first; day <= through; day++) {
    stats = applyTraining(stats, routineOn(companion, seed, day), growth);
  }
  return { ...companion, stats, lastGrownDay: through };
}

/**
 * Companions as of today: every day that has ended since one last grew is lived. Returns the
 * same object when nothing changed.
 */
export function companionsGrown(state: GameState): Companions {
  const through = state.time.day - 1;
  const companion = state.companions.owned[PLAYER_OWNER];
  if (!companion || companion.lastGrownDay >= through) return state.companions;
  return {
    ...state.companions,
    owned: {
      ...state.companions.owned,
      [PLAYER_OWNER]: caughtUp(companion, state.board.seed, through),
    },
  };
}
