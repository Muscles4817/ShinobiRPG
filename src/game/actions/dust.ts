import { weakFromHunger } from '../hunger';
import { buyDust, buyDustBlocker, makeBlocker, makeDust } from '../dust/supply';
import { studyScroll, studyScrollBlocker } from '../dust/scrolls';
import { laidUp } from '../injuries';
import { adjust, busyReason, firstBlocker, placesHere, spendTime } from '../ops';
import { hardWorkEnergy } from '../profile';
import { closedReason } from '../village';
import type { ActionHandler, ActionOf } from './types';

/**
 * Commanded dust between fights: reading an S-rank scroll a day at a time, and making or buying
 * the dust no ground gives back (`dust/scrolls.ts`, `dust/supply.ts`).
 */

const STUDY_SLOTS = 1;
const MAKE_SLOTS = 1;
/** Energy a batch made at home takes, before what eases hard work. */
const MAKE_ENERGY = 15;

export const studyDustScroll: ActionHandler<ActionOf<'studyDustScroll'>> = {
  check(state, { dustId }, ctx) {
    return firstBlocker(busyReason(state), studyScrollBlocker(state, ctx, dustId));
  },
  perform(state, { dustId }, ctx) {
    return spendTime(studyScroll(state, ctx, dustId), STUDY_SLOTS, ctx);
  },
};

export const makeABatch: ActionHandler<ActionOf<'makeDust'>> = {
  check(state, _action, ctx) {
    const energy = hardWorkEnergy(state.character, ctx, MAKE_ENERGY);
    return firstBlocker(
      busyReason(state),
      makeBlocker(state, ctx),
      weakFromHunger(state),
      laidUp(state, ctx),
      state.character.vitals.energy < energy && `Needs ${energy} energy. Nap or eat first.`,
    );
  },
  perform(state, _action, ctx) {
    const energy = hardWorkEnergy(state.character, ctx, MAKE_ENERGY);
    return adjust(spendTime(makeDust(state, ctx), MAKE_SLOTS, ctx), { energy: -energy });
  },
};

export const buyABatch: ActionHandler<ActionOf<'buyDust'>> = {
  check(state, { placeId }, ctx) {
    const shop = placesHere(state, ctx, 'gear').find((p) => p.id === placeId);
    return firstBlocker(
      busyReason(state),
      shop ? closedReason(shop.name, shop.hours, state) : null,
      buyDustBlocker(state, ctx, placeId),
    );
  },
  perform(state, _action, ctx) {
    return buyDust(state, ctx);
  },
};
