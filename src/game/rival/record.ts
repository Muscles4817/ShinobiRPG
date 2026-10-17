import { hashUnit } from '@/core';

import type { GameContext } from '../context';
import { findPerson } from '../people/cast';
import { personStats } from '../people/progress';
import type { GameState } from '../state';
import { chooseRival } from './choose';
import { newFirsts } from './grades';
import { CHALLENGE_LINES, DECLINED, RACE_CHALLENGE_LINES, type ChallengeReason } from './lines';
import { provocationToday } from './provocations';
import { courseEdge } from './race';
import { clampHeat, type Contest, type Rival } from './state';

/**
 * Keeps the rivalry going as actions happen (called from `dispatch`): chooses the rival once the
 * team is settled, scores the race to each grade, and as each day turns lets a standing
 * challenge lapse or makes a new one, for a reason (one of you just reached a grade first) or
 * now and then, never more often than `CHALLENGE_GAP`; on a quiet day they may needle you
 * instead. They challenge you on the ground that suits them: a race when the course favours
 * them, otherwise a spar or a race as the day falls.
 */

const CHALLENGE_GAP = 3;
/** Chance of a challenge on a quiet day, by temperament, once the gap has passed. */
const ROUTINE_CHANCE = { proud: 0.5, kind: 0.35, cold: 0.25 } as const;
/** How often a rival without the edge on the course still makes it a race. */
const RACE_SHARE = 0.4;

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

/** Their ground: a race when the course is theirs, otherwise as the day falls. */
export function groundFor(rival: Rival, state: GameState, ctx: GameContext): Contest {
  const person = findPerson(state, ctx, rival.personId);
  if (person && courseEdge(state.character.stats, personStats(person, state)) < 0) return 'race';
  return hashUnit(state.board.seed, state.time.day, 'rival-ground') < RACE_SHARE ? 'race' : 'spar';
}

function challenged(rival: Rival, firstsBefore: Rival, state: GameState, ctx: GameContext): Rival {
  const day = state.time.day;
  const reason =
    reasonSince(firstsBefore, rival) ??
    (hashUnit(state.board.seed, day, 'rival-challenge') < ROUTINE_CHANCE[rival.temperament]
      ? 'routine'
      : null);
  if (!reason) return rival;
  const contest = groundFor(rival, state, ctx);
  const lines = contest === 'race' ? RACE_CHALLENGE_LINES : CHALLENGE_LINES;
  const line = lines[rival.temperament][reason];
  return { ...rival, challenge: { day, line, contest }, lastChallengeDay: day };
}

function provoked(rival: Rival, state: GameState): Rival {
  const day = state.time.day;
  const provocation = provocationToday(rival, state.board.seed, day);
  return provocation
    ? { ...rival, beat: { kind: 'provocation', id: provocation.id }, lastProvocationDay: day }
    : rival;
}

/** As a day turns: a challenge left standing lapses (it cools things), or a new one is made. */
function dayTurned(rival: Rival, firstsBefore: Rival, state: GameState, ctx: GameContext): Rival {
  const day = state.time.day;
  if (rival.challenge) {
    if (rival.challenge.day + 1 >= day) return rival;
    const cost = Math.round(DECLINED[rival.temperament].heat / 2);
    return { ...rival, challenge: null, heat: clampHeat(rival.heat + cost) };
  }
  if (rival.beat || rival.race) return rival;
  const made =
    day - rival.lastChallengeDay < CHALLENGE_GAP
      ? rival
      : challenged(rival, firstsBefore, state, ctx);
  return made.challenge ? made : provoked(made, state);
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
      ? dayTurned(rival, before.rival ?? rival, after, ctx)
      : rival;
  return turned === after.rival ? after : { ...after, rival: turned };
}
