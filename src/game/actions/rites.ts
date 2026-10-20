import { stageForPair, stageOf } from '@/systems/bonds';

import { archiveBlocker, learnRite, riteBlocker, takeHive, takeHiveBlocker } from '../hives/rite';
import { compoundHere } from '../compounds';
import { busyReason, firstBlocker, spendTime } from '../ops';
import { bondOf, findPerson, whereNow } from '../people/cast';
import type { ActionHandler, ActionOf } from './types';

/**
 * Learning a hive clan's rite (`hives/rite.ts`) from its archive or from someone of the clan,
 * and taking the hive at home once you know it.
 */

/** Reading the rite through takes an afternoon; being taught it, an evening's talk. */
const RITE_SLOTS = 1;

export const readRite: ActionHandler<ActionOf<'readRite'>> = {
  check(state, { placeId }, ctx) {
    return firstBlocker(busyReason(state), archiveBlocker(state, ctx, placeId));
  },
  perform(state, { placeId }, ctx) {
    const compound = compoundHere(state, ctx, placeId);
    if (!compound) return state;
    const how = 'The archivist unseals the rite and leaves you alone with it until you know it.';
    return spendTime(learnRite(state, ctx, compound.clanId, how), RITE_SLOTS, ctx);
  },
};

export const learnRiteFrom: ActionHandler<ActionOf<'learnRite'>> = {
  check(state, { personId }, ctx) {
    const person = findPerson(state, ctx, personId);
    const offer = person?.hiveRite;
    if (!person || !offer) return 'They have no rite to teach.';
    return firstBlocker(
      busyReason(state),
      riteBlocker(state, offer.clanId),
      whereNow(state, ctx, person) === null && `${person.name} isn’t around right now.`,
      stageOf(bondOf(state, person.id).points) < offer.minStage &&
        `${person.name} would teach it only to someone ${stageForPair(offer.minStage)} with them.`,
    );
  },
  perform(state, { personId }, ctx) {
    const person = findPerson(state, ctx, personId);
    const offer = person?.hiveRite;
    if (!person || !offer) return state;
    const how = `${person.name} tells you how it is done, slowly, as if it hurt to remember.`;
    return spendTime(learnRite(state, ctx, offer.clanId, how), RITE_SLOTS, ctx);
  },
};

export const takeAHive: ActionHandler<ActionOf<'takeHive'>> = {
  check(state, { clanId }, ctx) {
    return firstBlocker(busyReason(state), takeHiveBlocker(state, ctx, clanId));
  },
  perform(state, { clanId, share }, ctx) {
    return takeHive(state, ctx, clanId, share);
  },
};
