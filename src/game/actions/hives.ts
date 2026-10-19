import { weakFromHunger } from '../hunger';
import {
  beginCross,
  crossBlocker,
  nameBlocker,
  nameStrain,
  seekBlocker,
  seekInsects,
  studyBlocker,
  studyJar,
} from '../hives/breeding';
import { laidUp } from '../injuries';
import { adjust, busyReason, firstBlocker, spendTime } from '../ops';
import { hardWorkEnergy } from '../profile';
import type { ActionHandler, ActionOf } from './types';

/**
 * Keeping a hive between fights: searching a wild place for insects to jar, studying a jar at
 * home, crossing it into the hive, and naming the strain that hatches (`hives/breeding.ts`).
 */

/** Energy a search through the wild takes, before what eases hard work. */
const SEEK_ENERGY = 10;
const SEEK_SLOTS = 1;
const STUDY_SLOTS = 1;

export const searchForInsects: ActionHandler<ActionOf<'seekInsects'>> = {
  check(state, { placeId }, ctx) {
    const energy = hardWorkEnergy(state.character, ctx, SEEK_ENERGY);
    return firstBlocker(
      busyReason(state),
      weakFromHunger(state),
      laidUp(state, ctx),
      state.character.vitals.energy < energy && `Needs ${energy} energy. Nap or eat first.`,
      seekBlocker(state, ctx, placeId),
    );
  },
  perform(state, { placeId }, ctx, rng) {
    const energy = hardWorkEnergy(state.character, ctx, SEEK_ENERGY);
    const found = seekInsects(state, ctx, placeId, rng);
    return adjust(spendTime(found, SEEK_SLOTS, ctx), { energy: -energy });
  },
};

export const studyAJar: ActionHandler<ActionOf<'studyJar'>> = {
  check(state, { strainId }, ctx) {
    return firstBlocker(busyReason(state), studyBlocker(state, ctx, strainId));
  },
  perform(state, { strainId }, ctx) {
    return spendTime(studyJar(state, ctx, strainId), STUDY_SLOTS, ctx);
  },
};

export const crossAJar: ActionHandler<ActionOf<'crossJar'>> = {
  check(state, { strainId }, ctx) {
    return firstBlocker(busyReason(state), crossBlocker(state, ctx, strainId));
  },
  perform(state, { strainId }, ctx) {
    return beginCross(state, ctx, strainId);
  },
};

export const nameYourStrain: ActionHandler<ActionOf<'nameStrain'>> = {
  check(state, { name }) {
    return nameBlocker(state, name);
  },
  perform(state, { name }) {
    return nameStrain(state, name);
  },
};
