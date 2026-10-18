import { fillSlots } from '@/core';

import { firstBlocker, log } from '../ops';
import { findPerson } from '../people/cast';
import { personSlots } from '../people/pronouns';
import { PURSE, runRaceLeg as runLeg, startRace } from '../rival/contest';
import { TAKEN_UP } from '../rival/lines';
import { contestBlocker, rivalSlots } from './rival';
import { spar } from './spar';
import type { ActionHandler, ActionOf } from './types';

/**
 * Settling it on your terms: you put the challenge to your rival, on the ground you choose (a
 * spar or a race) and for what stakes, once a day at most; and a race run leg by leg.
 */

export const challengeRival: ActionHandler<ActionOf<'challengeRival'>> = {
  check(state, action, ctx) {
    const rival = state.rival;
    if (!rival) return 'You have no rival yet.';
    const slots = rivalSlots(state, ctx);
    return firstBlocker(
      rival.challenge !== null &&
        fillSlots('{name} {name.has} already challenged you. Answer that first.', slots),
      rival.lastChallengeDay === state.time.day &&
        fillSlots('You’ve already had it out with {name.them} today.', slots),
      action.stakes === 'purse' && state.wallet.ryo < PURSE && `A purse needs ${PURSE} ryo.`,
      contestBlocker(state, ctx),
    );
  },
  perform(state, action, ctx, rng) {
    const rival = state.rival;
    const person = rival && findPerson(state, ctx, rival.personId);
    if (!rival || !person) return state;
    const put = log(
      { ...state, rival: { ...rival, lastChallengeDay: state.time.day } },
      {
        heading: `You challenge ${person.name}`,
        text: fillSlots(TAKEN_UP[rival.temperament], personSlots('name', person)),
        tone: 'info',
      },
    );
    if (action.contest === 'race') return startRace(put, ctx, action.stakes, rng);
    const staked = put.rival ? { ...put, rival: { ...put.rival, sparStakes: action.stakes } } : put;
    return spar.perform(staked, { type: 'spar', personId: person.id }, ctx, rng);
  },
};

export const runRaceLeg: ActionHandler<ActionOf<'runRaceLeg'>> = {
  check(state) {
    return state.rival?.race ? null : 'You aren’t racing anyone.';
  },
  perform(state, action, ctx, rng) {
    return runLeg(state, ctx, action.move, rng);
  },
};
