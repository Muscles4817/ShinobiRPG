import { weakFromHunger } from '../hunger';
import { laidUp } from '../injuries';
import { adjust, busyReason, firstBlocker, spendTime } from '../ops';
import { hardWorkEnergy } from '../profile';
import { mendBlocker, mendPuppet } from '../puppetry/mending';
import type { ActionHandler, ActionOf } from './types';

/** Your puppets between fights: mending one at your bench at home (`puppetry/mending.ts`). */

const MEND_SLOTS = 1;
/** Energy a session at the bench takes, before what eases hard work. */
const MEND_ENERGY = 15;

export const mendAPuppet: ActionHandler<ActionOf<'mendPuppet'>> = {
  check(state, { frameId }, ctx) {
    const energy = hardWorkEnergy(state.character, ctx, MEND_ENERGY);
    return firstBlocker(
      busyReason(state),
      mendBlocker(state, ctx, frameId),
      weakFromHunger(state),
      laidUp(state, ctx),
      state.character.vitals.energy < energy && `Needs ${energy} energy. Nap or eat first.`,
    );
  },
  perform(state, { frameId }, ctx) {
    const energy = hardWorkEnergy(state.character, ctx, MEND_ENERGY);
    return adjust(spendTime(mendPuppet(state, ctx, frameId), MEND_SLOTS, ctx), {
      energy: -energy,
    });
  },
};
