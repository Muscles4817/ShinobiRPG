import { fillSlots } from '@/core';

import type { GameContext } from '../context';
import { placeHere, busyReason, firstBlocker, healthFraction, log, chip } from '../ops';
import { findPerson } from '../people/cast';
import { personSlots } from '../people/pronouns';
import { toneReaction } from '../people/together';
import { hardWorkEnergy } from '../profile';
import { weakFromHunger } from '../hunger';
import { laidUp } from '../injuries';
import { startRace } from '../rival/contest';
import { ANSWER, DECLINED, type ReplyOption } from '../rival/lines';
import { groundFor } from '../rival/record';
import { heard, repliesFor } from '../rival/replies';
import { clampHeat, heatStage, HEAT_STAGES, type Rival } from '../rival/state';
import type { GameState } from '../state';
import { spar, SPAR_ENERGY } from './spar';
import type { ActionHandler, ActionOf } from './types';

/**
 * Your side of the rivalry: answering them (when you meet, after a contest, when they needle
 * you), and taking up or turning down their challenge. What you say moves the heat by the
 * moment and by their tastes, the same tastes that decide how any talk lands; your team and
 * sensei hear it and lean by theirs. A barbed answer rattles them for the next race, and
 * "settle it" to a provocation has them name the day.
 */

const MIN_HEALTH_TO_CONTEST = 0.4;
const SETTLE_IT = '“Tomorrow, then. Don’t be late.”';
/** Your rival, when there is no telling who: lines still read. */
const ANY_RIVAL = { id: 'rival', name: 'your rival', pronouns: 'they' } as const;

/** `{name}` and its pronoun slots for your rival, for lines about them. */
export function rivalSlots(state: GameState, ctx: GameContext): Readonly<Record<string, string>> {
  const person = state.rival ? findPerson(state, ctx, state.rival.personId) : undefined;
  return personSlots('name', person ?? ANY_RIVAL);
}

/** Why you can't settle it with them right now, if you can't. */
export function contestBlocker(state: GameState, ctx: GameContext): string | null {
  const energy = hardWorkEnergy(state.character, ctx, SPAR_ENERGY);
  return firstBlocker(
    busyReason(state),
    weakFromHunger(state),
    laidUp(state, ctx),
    !placeHere(state, ctx, 'training') &&
      fillSlots('Meet {name.them} at a training ground.', rivalSlots(state, ctx)),
    state.character.vitals.energy < energy && `Needs ${energy} energy. Nap or eat first.`,
    healthFraction(state) < MIN_HEALTH_TO_CONTEST && 'You are too hurt for that. Rest first.',
  );
}

/** The rival after your answer: the heat, whether it rattled them, and any challenge it drew. */
function answered(state: GameState, ctx: GameContext, rival: Rival, option: ReplyOption): Rival {
  const person = findPerson(state, ctx, rival.personId);
  const delta = option.heat + (person ? toneReaction(ctx, person, option.tone) : 0);
  const settle =
    rival.beat?.kind === 'provocation' && option.tone === 'challenge' && !rival.challenge;
  return {
    ...rival,
    heat: clampHeat(rival.heat + delta),
    beat: null,
    rattled: rival.rattled || option.rattles === true,
    ...(settle
      ? {
          challenge: {
            day: state.time.day,
            line: SETTLE_IT,
            contest: groundFor(rival, state, ctx),
          },
          lastChallengeDay: state.time.day,
        }
      : {}),
  };
}

/** The heat changing stage, and their being rattled, as chips. */
function answerChips(before: Rival, after: Rival) {
  const moved = heatStage(after.heat) - heatStage(before.heat);
  const stage = HEAT_STAGES[heatStage(after.heat)] ?? 'Grudging';
  return [
    ...(moved !== 0 ? [chip(`Rivalry: ${stage.toLowerCase()}`, moved > 0 ? 'gain' : 'cost')] : []),
    ...(after.rattled && !before.rattled ? [chip('Rattled', 'info')] : []),
  ];
}

export const answerRival: ActionHandler<ActionOf<'answerRival'>> = {
  check(state, action) {
    const rival = state.rival;
    if (!rival?.beat) return 'Nobody is waiting for an answer.';
    return repliesFor(state, rival, rival.beat)[action.choiceIndex]
      ? null
      : 'That isn’t one of the answers.';
  },
  perform(state, action, ctx) {
    const rival = state.rival;
    const option = rival?.beat && repliesFor(state, rival, rival.beat)[action.choiceIndex];
    const person = rival && findPerson(state, ctx, rival.personId);
    if (!rival || !option || !person) return state;
    const next = answered(state, ctx, rival, option);
    const warmer = next.heat >= rival.heat;
    const told = rival.beat.kind === 'meeting' ? state : heard(state, ctx, option.tone);
    return log(
      { ...told, rival: next },
      {
        heading: person.name,
        text: fillSlots(
          ANSWER[rival.temperament][warmer ? 'warmer' : 'cooler'],
          personSlots('name', person),
        ),
        tone: warmer ? 'success' : 'warning',
        chips: answerChips(rival, next),
      },
    );
  },
};

export const acceptChallenge: ActionHandler<ActionOf<'acceptChallenge'>> = {
  check(state, _action, ctx) {
    if (!state.rival?.challenge) return 'Nobody has challenged you.';
    return contestBlocker(state, ctx);
  },
  perform(state, _action, ctx, rng) {
    const rival = state.rival;
    const contest = rival?.challenge?.contest;
    if (!rival || !contest) return state;
    if (contest === 'race') return startRace(state, ctx, 'pride', rng);
    const taken = { ...state, rival: { ...rival, challenge: null, sparStakes: null } };
    return spar.perform(taken, { type: 'spar', personId: rival.personId }, ctx, rng);
  },
};

export const declineChallenge: ActionHandler<ActionOf<'declineChallenge'>> = {
  check(state) {
    return state.rival?.challenge ? null : 'Nobody has challenged you.';
  },
  perform(state, _action, ctx) {
    const rival = state.rival;
    const person = rival && findPerson(state, ctx, rival.personId);
    if (!rival || !person) return state;
    const declined = DECLINED[rival.temperament];
    return log(
      {
        ...state,
        rival: { ...rival, challenge: null, heat: clampHeat(rival.heat + declined.heat) },
      },
      {
        heading: `Turned down ${person.name}`,
        text: fillSlots(declined.line, personSlots('name', person)),
        tone: 'info',
      },
    );
  },
};
