import { spend } from '@/systems/wallet';
import { applyTraining, diffStats, STAT_INFO, type StatDelta } from '@/systems/stats';
import { isHungry, METER_MAX, sleepRecovery } from '@/systems/vitals';
import { slotsUntilNextMorning } from '@/systems/time';

import { adjust, busyReason, firstBlocker, healthFraction, log, spendTime } from '../ops';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/** Everyday life in the village: training, eating and resting. */

const HUNGRY_TRAINING_EFFICIENCY = 0.5;
const NAP_ENERGY = 30;
const MIN_HEALTH_TO_TRAIN = 0.2;

function describeGains(delta: StatDelta): string {
  return Object.entries(delta)
    .map(([id, value]) => `${STAT_INFO[id as keyof typeof STAT_INFO].label} +${value}`)
    .join(', ');
}

export const train: ActionHandler<ActionOf<'train'>> = {
  check(state, action, ctx) {
    const def = ctx.content.training.get(action.trainingId);
    if (!def) return 'Unknown training.';
    return firstBlocker(
      busyReason(state),
      state.character.vitals.energy < def.energyCost && 'You are too tired to train.',
      healthFraction(state) < MIN_HEALTH_TO_TRAIN && 'You are too injured to train.',
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.training.require(action.trainingId);
    const hungry = isHungry(state.character.vitals);
    const before = state.character.stats;
    const stats = applyTraining(before, def.gains, hungry ? HUNGRY_TRAINING_EFFICIENCY : 1);

    let next: GameState = { ...state, character: { ...state.character, stats } };
    next = adjust(spendTime(next, def.slots), { energy: -def.energyCost });
    const note = hungry ? ' Your rumbling stomach made it hard to focus.' : '';
    return log(next, `${def.name}: ${describeGains(diffStats(before, stats))}.${note}`);
  },
};

export const eat: ActionHandler<ActionOf<'eat'>> = {
  check(state, action, ctx) {
    const def = ctx.content.foods.get(action.foodId);
    if (!def) return 'Unknown food.';
    return firstBlocker(
      busyReason(state),
      state.wallet.ryo < def.cost && `You can't afford it (${def.cost} ryo).`,
      state.character.vitals.satiety >= METER_MAX && 'You are completely full.',
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.foods.require(action.foodId);
    const paid = spend(state.wallet, def.cost);
    if (!paid.ok) return state;
    const next = adjust(
      { ...state, wallet: paid.value },
      { satiety: def.satiety, energy: def.energy },
    );
    return log(spendTime(next, def.slots), `You eat ${def.name} (−${def.cost} ryo).`);
  },
};

export const rest: ActionHandler<ActionOf<'rest'>> = {
  check(state) {
    return firstBlocker(
      busyReason(state),
      state.character.vitals.energy >= METER_MAX && 'You are not tired.',
    );
  },
  perform(state) {
    return log(adjust(spendTime(state, 1), { energy: NAP_ENERGY }), 'You take a long nap.');
  },
};

export const sleep: ActionHandler<ActionOf<'sleep'>> = {
  check(state) {
    return busyReason(state);
  },
  perform(state) {
    const hungryAtBedtime = isHungry(state.character.vitals);
    const recovery = sleepRecovery(state.character.vitals, state.character.stats);
    const rested = adjust(spendTime(state, slotsUntilNextMorning(state.time)), recovery);
    const text = hungryAtBedtime
      ? 'You sleep fitfully on an empty stomach.'
      : 'You sleep soundly and wake refreshed.';
    return log(rested, text, hungryAtBedtime ? 'warning' : 'info');
  },
};
