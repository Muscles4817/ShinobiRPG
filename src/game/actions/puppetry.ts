import { weakFromHunger } from '../hunger';
import { laidUp } from '../injuries';
import { adjust, busyReason, firstBlocker, placesHere, spendTime } from '../ops';
import { hardWorkEnergy } from '../profile';
import { mendBlocker, mendPuppet } from '../puppetry/mending';
import {
  buyMaterial,
  buyMaterialBlocker,
  renameBlocker,
  renamePuppet,
  startBuild,
  startBuildBlocker,
  workBlocker,
  workOnBuild,
} from '../puppetry/bench';
import { closedReason } from '../village';
import type { ActionHandler, ActionOf } from './types';

/**
 * Your puppets between fights: mending one at your bench at home (`puppetry/mending.ts`), and
 * building or rebuilding one, with materials bought by the lot (`puppetry/bench.ts`).
 */

const MEND_SLOTS = 1;
/** Energy a session at the bench takes, before what eases hard work. */
const MEND_ENERGY = 15;

export const mendAPuppet: ActionHandler<ActionOf<'mendPuppet'>> = {
  check(state, { puppetId }, ctx) {
    const energy = hardWorkEnergy(state.character, ctx, MEND_ENERGY);
    return firstBlocker(
      busyReason(state),
      mendBlocker(state, ctx, puppetId),
      weakFromHunger(state),
      laidUp(state, ctx),
      state.character.vitals.energy < energy && `Needs ${energy} energy. Nap or eat first.`,
    );
  },
  perform(state, { puppetId }, ctx) {
    const energy = hardWorkEnergy(state.character, ctx, MEND_ENERGY);
    return adjust(spendTime(mendPuppet(state, ctx, puppetId), MEND_SLOTS, ctx), {
      energy: -energy,
    });
  },
};

/** Energy a day at the bench takes, before what eases hard work. */
const BENCH_ENERGY = 15;
const BENCH_SLOTS = 1;

export const buyAMaterial: ActionHandler<ActionOf<'buyMaterial'>> = {
  check(state, sale, ctx) {
    const shop = placesHere(state, ctx, 'gear').find((p) => p.id === sale.placeId);
    return firstBlocker(
      busyReason(state),
      shop ? closedReason(shop.name, shop.hours, state) : null,
      buyMaterialBlocker(state, ctx, sale),
    );
  },
  perform(state, { materialId }, ctx) {
    return buyMaterial(state, ctx, materialId);
  },
};

export const startABuild: ActionHandler<ActionOf<'startBuild'>> = {
  check(state, { order }, ctx) {
    return firstBlocker(busyReason(state), startBuildBlocker(state, ctx, order));
  },
  perform(state, { order }, ctx) {
    return startBuild(state, ctx, order);
  },
};

export const workAtTheBench: ActionHandler<ActionOf<'workOnBuild'>> = {
  check(state, _action, ctx) {
    const energy = hardWorkEnergy(state.character, ctx, BENCH_ENERGY);
    return firstBlocker(
      busyReason(state),
      workBlocker(state, ctx),
      weakFromHunger(state),
      laidUp(state, ctx),
      state.character.vitals.energy < energy && `Needs ${energy} energy. Nap or eat first.`,
    );
  },
  perform(state, _action, ctx) {
    const energy = hardWorkEnergy(state.character, ctx, BENCH_ENERGY);
    return adjust(spendTime(workOnBuild(state), BENCH_SLOTS, ctx), { energy: -energy });
  },
};

export const renameAPuppet: ActionHandler<ActionOf<'renamePuppet'>> = {
  check(state, { puppetId, name }) {
    return renameBlocker(state, puppetId, name);
  },
  perform(state, { puppetId, name }) {
    return renamePuppet(state, puppetId, name);
  },
};
