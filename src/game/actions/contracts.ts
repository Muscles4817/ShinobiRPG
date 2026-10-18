import { stageForPair, stageOf } from '@/systems/bonds';

import { breakContract, makeOffering, offeringBlocker } from '../contracts/keeping';
import { signBlocker, signContract } from '../contracts/summons';
import { busyReason, firstBlocker } from '../ops';
import { bondOf, findPerson, whereNow } from '../people/cast';
import type { ActionHandler, ActionOf } from './types';

/**
 * Keeping and breaking a summoning contract, and signing a teacher's (`TeacherProfile.contract`).
 */

/** Leaving the clan an offering it likes, at home, once a day (`contracts/keeping.ts`). */
export const leaveOffering: ActionHandler<ActionOf<'makeOffering'>> = {
  check(state, { ingredientId }, ctx) {
    return firstBlocker(busyReason(state), offeringBlocker(state, ctx, ingredientId));
  },
  perform(state, { ingredientId }, ctx) {
    return makeOffering(state, ctx, ingredientId);
  },
};

/** Tearing up your name on the clan's scroll: free to sign another, never this one again. */
export const tearUpContract: ActionHandler<ActionOf<'breakContract'>> = {
  check(state) {
    return firstBlocker(busyReason(state), !state.contract && 'You hold no contract.');
  },
  perform(state, _action, ctx) {
    return breakContract(state, ctx);
  },
};

/**
 * Signing a teacher's summoning contract (`TeacherProfile.contract`): once you are close enough,
 * they let you put your name on their scroll, where they are, if you hold no contract yet.
 */
export const signTeacherContract: ActionHandler<ActionOf<'signContract'>> = {
  check(state, { personId }, ctx) {
    const person = findPerson(state, ctx, personId);
    const offer = person?.teacher?.contract;
    if (!person || !offer) return 'They have no contract to offer.';
    return firstBlocker(
      busyReason(state),
      signBlocker(state, offer.contractId),
      whereNow(state, ctx, person) === null && `${person.name} isn’t around right now.`,
      stageOf(bondOf(state, person.id).points) < offer.minStage &&
        `${person.name} lets only those ${stageForPair(offer.minStage)} with them sign.`,
    );
  },
  perform(state, { personId }, ctx) {
    const offer = findPerson(state, ctx, personId)?.teacher?.contract;
    return offer ? signContract(state, ctx, offer.contractId) : state;
  },
};
