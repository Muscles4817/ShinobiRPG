import type { Rng } from '@/core';
import type { PersonDef } from '@/content';
import { recordMeeting } from '@/systems/bonds';
import { diffStats, type StatDelta } from '@/systems/stats';
import { deduct, earn } from '@/systems/wallet';

import type { GameContext } from '../context';
import { growCharacter, logDiscoveries } from '../growth';
import { adjust, chip, log, spendTime, statChips } from '../ops';
import { bondOf, findPerson } from '../people/cast';
import { personStats, trainPerson } from '../people/progress';
import { hardWorkEnergy } from '../profile';
import type { GameState } from '../state';
import {
  finishOf,
  legEdge,
  marginWords,
  newRace,
  RACE_LEGS,
  readsThem,
  runLeg,
  theirMoveFor,
  type Finish,
} from './race';
import { rivalLine } from './lines';
import { legLines } from './raceLines';
import type { RaceMove, RaceRun, Rival, Stakes } from './state';

/**
 * Settling it with your rival: a race run leg by leg (the rules are `race.ts`), and what rides
 * on any contest. A purse is put up by both sides; the winner takes it. A race works the legs
 * of both runners, counts as time together, and ends in a word between you (unless it was a
 * dead heat).
 */

export const PURSE = 50;
export const RACE_ENERGY = 20;
const RACE_SLOTS = 1;
const RACE_GAINS: StatDelta = { speed: 0.5, stamina: 0.5 };
const RIVAL_RACE_GAINS: StatDelta = { speed: 0.3, stamina: 0.3 };
const RACE_BOND = 3;

const FINISH_LINE: Readonly<Record<Finish, string>> = {
  won: 'You touch the bell tower first.',
  lost: '{name} touches the bell tower first.',
  tie: 'You touch the bell tower together, and neither will say who was first.',
};

/** The purse changes hands: yours if you won, theirs if you lost, back to each on a dead heat. */
export function settlePurse(state: GameState, stakes: Stakes, finish: Finish): GameState {
  if (stakes !== 'purse' || finish === 'tie') return state;
  const wallet = finish === 'won' ? earn(state.wallet, PURSE) : deduct(state.wallet, PURSE);
  return { ...state, wallet };
}

function purseChip(stakes: Stakes, finish: Finish) {
  if (stakes !== 'purse' || finish === 'tie') return [];
  return [chip(`${finish === 'won' ? '+' : '−'}${PURSE} ryo`, finish === 'won' ? 'gain' : 'cost')];
}

/** What they mean to do on the coming leg, and whether you can read it. */
function nextLeg(
  state: GameState & { readonly rival: Rival },
  ctx: GameContext,
  race: Pick<RaceRun, 'leg' | 'margin'>,
  rng: Rng,
): Pick<RaceRun, 'theirMove' | 'read'> {
  const { rival } = state;
  const person = findPerson(state, ctx, rival.personId);
  const theirs = person ? personStats(person, state) : state.character.stats;
  return {
    theirMove: theirMoveFor(race, rival.temperament, rival.rattled, rng),
    read: readsThem(state.character.stats, theirs, rng),
  };
}

/** Off the mark: the slot and the legs it costs, and the first leg's read of them. */
export function startRace(state: GameState, ctx: GameContext, stakes: Stakes, rng: Rng): GameState {
  const rival = state.rival;
  if (!rival) return state;
  const ready = adjust(spendTime(state, RACE_SLOTS, ctx), {
    energy: -hardWorkEnergy(state.character, ctx, RACE_ENERGY),
  });
  const race = newRace(stakes, nextLeg({ ...ready, rival }, ctx, { leg: 0, margin: 0 }, rng));
  return { ...ready, rival: { ...rival, challenge: null, race } };
}

function finishRace(
  state: GameState & { readonly rival: Rival },
  ctx: GameContext,
  person: PersonDef,
  race: RaceRun,
): GameState {
  const { rival } = state;
  const finish = finishOf(race.margin);
  const races = {
    you: rival.races.you + (finish === 'won' ? 1 : 0),
    them: rival.races.them + (finish === 'lost' ? 1 : 0),
  };
  const grown = growCharacter(state.character, RACE_GAINS, ctx);
  const people = trainPerson(state, ctx, person, RIVAL_RACE_GAINS);
  const bonds = {
    ...people.bonds,
    [person.id]: recordMeeting(bondOf(state, person.id), { day: state.time.day, delta: RACE_BOND }),
  };
  const beat = finish === 'tie' ? null : ({ kind: 'after-race', won: finish === 'won' } as const);
  const settled = settlePurse(
    {
      ...state,
      character: grown.character,
      people: { ...people, bonds },
      rival: { ...rival, races, race: null, rattled: false, beat },
    },
    race.stakes,
    finish,
  );
  const logged = log(settled, {
    heading: `Race with ${person.name}`,
    text: rivalLine([...race.told, FINISH_LINE[finish]].join(' '), person),
    tone: finish === 'won' ? 'success' : 'info',
    chips: [
      ...statChips(diffStats(state.character.stats, grown.character.stats)),
      ...purseChip(race.stakes, finish),
    ],
  });
  return logDiscoveries(logged, grown.discovered, ctx);
}

/** One leg run: the ground made, then the next leg's read of them, or the finish. */
export function runRaceLeg(
  state: GameState,
  ctx: GameContext,
  move: RaceMove,
  rng: Rng,
): GameState {
  const rival = state.rival;
  const race = rival?.race;
  const person = rival && findPerson(state, ctx, rival.personId);
  const leg = race && RACE_LEGS[race.leg];
  if (!rival || !race || !person || !leg) return state;
  const edge = legEdge(state.character.stats, personStats(person, state), leg);
  const result = runLeg({ race, yourMove: move, edge, rattled: rival.rattled }, rng);
  const margin = race.margin + result.gained;
  const told = [...legLines(move, race.theirMove, result), marginWords(margin, '{name}')].join(' ');
  const ran: RaceRun = {
    ...race,
    leg: race.leg + 1,
    margin,
    yourStrain: race.yourStrain + (move === 'push' ? 1 : 0),
    theirStrain: race.theirStrain + (race.theirMove === 'push' ? 1 : 0),
    told: [...race.told, told],
  };
  const withRival = { ...state, rival };
  if (ran.leg >= RACE_LEGS.length) return finishRace(withRival, ctx, person, ran);
  const next = { ...ran, ...nextLeg(withRival, ctx, ran, rng) };
  return { ...state, rival: { ...rival, race: next } };
}
