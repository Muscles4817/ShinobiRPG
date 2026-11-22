import { hashUnit } from '@/core';
import type { PersonDef } from '@/content';

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
 * Keeps the rivalry going as actions happen (happenings after each action, `happenings/`): chooses
 * the rival once the team is settled, scores the race to each grade, and as each day turns lets a standing
 * challenge lapse or makes a new one, for a reason (one of you just reached a grade first) or
 * now and then, never more often than `CHALLENGE_GAP`; on a quiet day they may needle you
 * instead. They challenge you on the ground that suits them: a race when the course favours
 * them, otherwise a spar or a race as the day falls.
 *
 * The day's turn needs the two of you in one town (the happening's `with` need): while you are
 * apart (another town, a job, a journey, an exam) nothing is made, and a challenge left standing
 * simply lapses (`rivalApart`), at no cost, since you never turned it down.
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

/** The rival after `change`, written back only if it changed. */
function withRival(state: GameState, change: (rival: Rival) => Rival): GameState {
  if (!state.rival) return state;
  const next = change(state.rival);
  return next === state.rival ? state : { ...state, rival: next };
}

/** Once your team is settled (and your nature read, and your sensei met), a rival is chosen. */
export function rivalChosen(state: GameState, ctx: GameContext): GameState {
  if (state.rival) return state;
  const settled =
    state.people.team?.senseiId && state.character.natureKnown && !state.mentor.opening;
  const rival = settled ? chooseRival(state, ctx) : null;
  return rival ? { ...state, rival } : state;
}

/** Who reached each grade first, scored as it happens, wherever you both are. */
export function rivalScored(state: GameState, ctx: GameContext): GameState {
  return withRival(state, (rival) => scored(rival, state, ctx));
}

/** As a day turns, with the two of you in one town: a challenge lapses or is made. */
export function rivalDayTurned(before: GameState, state: GameState, ctx: GameContext): GameState {
  if (state.time.day === before.time.day) return state;
  return withRival(state, (rival) => dayTurned(rival, before.rival ?? rival, state, ctx));
}

/** While you are apart a challenge can't stand: it lapses, and you never turned it down. */
export function rivalApart(state: GameState): GameState {
  return withRival(state, (rival) => (rival.challenge ? { ...rival, challenge: null } : rival));
}

/** Your rival, for the happenings that need the two of you in one town. */
export function rivalPerson(state: GameState, ctx: GameContext): PersonDef | undefined {
  return state.rival ? findPerson(state, ctx, state.rival.personId) : undefined;
}
