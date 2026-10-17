import { hashUnit } from '@/core';

import type { GameContext } from '../context';
import { findPerson } from '../people/cast';
import { personStats } from '../people/progress';
import type { GameState } from '../state';
import { chooseRival } from './choose';
import { newFirsts } from './grades';
import { CHALLENGE_LINES, DECLINED, type ChallengeReason } from './lines';
import { clampHeat, type Rival } from './state';

/**
 * Keeps the rivalry going as actions happen (called from `dispatch`): chooses the rival once the
 * team is settled, scores the race to each grade, and as each day turns lets a standing
 * challenge lapse or makes a new one, for a reason (one of you just reached a grade first) or
 * now and then, never more often than `CHALLENGE_GAP`.
 */

const CHALLENGE_GAP = 3;
/** Chance of a challenge on a quiet day, by temperament, once the gap has passed. */
const ROUTINE_CHANCE = { proud: 0.5, kind: 0.35, cold: 0.25 } as const;

function scored(rival: Rival, state: GameState, ctx: GameContext): Rival {
  const person = findPerson(state, ctx, rival.personId);
  if (!person) return rival;
  const found = newFirsts(rival, state.character.stats, personStats(person, state));
  if (found.length === 0) return rival;
  return {
    ...rival,
    firsts: { ...rival.firsts, ...Object.fromEntries(found.map((f) => [f.key, f.who])) },
  };
}

function reasonSince(before: Rival, after: Rival): ChallengeReason | null {
  const fresh = Object.entries(after.firsts).filter(([key]) => !before.firsts[key]);
  if (fresh.some(([, who]) => who === 'them')) return 'they-first';
  if (fresh.some(([, who]) => who === 'you')) return 'you-first';
  return null;
}

/** As a day turns: a challenge left standing lapses (it cools things), or a new one is made. */
function dayTurned(rival: Rival, firstsBefore: Rival, state: GameState): Rival {
  const day = state.time.day;
  if (rival.challenge) {
    if (rival.challenge.day + 1 >= day) return rival;
    const cost = Math.round(DECLINED[rival.temperament].heat / 2);
    return { ...rival, challenge: null, heat: clampHeat(rival.heat + cost) };
  }
  if (rival.beat || day - rival.lastChallengeDay < CHALLENGE_GAP) return rival;
  const reason =
    reasonSince(firstsBefore, rival) ??
    (hashUnit(state.board.seed, day, 'rival-challenge') < ROUTINE_CHANCE[rival.temperament]
      ? 'routine'
      : null);
  if (!reason) return rival;
  const line = CHALLENGE_LINES[rival.temperament][reason];
  return { ...rival, challenge: { day, line }, lastChallengeDay: day };
}

function away(state: GameState): boolean {
  return state.mission !== null || state.exams.run !== null;
}

export function noteRival(before: GameState, after: GameState, ctx: GameContext): GameState {
  if (!after.rival) {
    const settled =
      after.people.team?.senseiId && after.character.natureKnown && !after.mentor.opening;
    const rival = settled ? chooseRival(after, ctx) : null;
    return rival ? { ...after, rival } : after;
  }
  const rival = scored(after.rival, after, ctx);
  const turned =
    after.time.day !== before.time.day && !away(after)
      ? dayTurned(rival, before.rival ?? rival, after)
      : rival;
  return turned === after.rival ? after : { ...after, rival: turned };
}
