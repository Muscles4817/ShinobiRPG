import { isRentOverdue } from '@/systems/housing';
import { applyTraining, diffStats } from '@/systems/stats';
import { slotsUntilNextMorning } from '@/systems/time';
import { isHungry, METER_MAX, sleepRecovery } from '@/systems/vitals';
import { spend } from '@/systems/wallet';

import {
  adjust,
  busyReason,
  chip,
  firstBlocker,
  healthFraction,
  log,
  placeHere,
  spendTime,
  statChips,
} from '../ops';
import type { GameContext } from '../context';
import { trainingScale } from '../profile';
import type { GameState } from '../state';
import { closedReason, isOpen, marketPrice, stallsHere } from '../village';
import type { ActionHandler, ActionOf } from './types';

/** Everyday life in a village: training, eating, napping and sleeping. */

const NAP_ENERGY = 30;
const MIN_HEALTH_TO_TRAIN = 0.2;
const LOCKED_OUT_RECOVERY = 0.4;

function offeredHere(state: GameState, ctx: GameContext) {
  return {
    training: (id: string) => placeHere(state, ctx, 'training')?.trainingIds.includes(id) ?? false,
  };
}

/** The stall here selling this food, preferring one that is open now. */
function foodStall(state: GameState, ctx: GameContext, foodId: string) {
  const stalls = stallsHere(state, ctx).filter((s) => s.foodIds.includes(foodId));
  return stalls.find((s) => isOpen(s.hours, state)) ?? stalls[0];
}

/** Why the character can't use their home right now, or null. */
export function homeBlocker(state: GameState, ctx: GameContext): string | null {
  const home = placeHere(state, ctx, 'home');
  if (home?.id !== state.housing.placeId) return 'Your home is not in this village.';
  return null;
}

export const train: ActionHandler<ActionOf<'train'>> = {
  check(state, action, ctx) {
    const def = ctx.content.training.get(action.trainingId);
    if (!def || !offeredHere(state, ctx).training(def.id)) return 'You can’t train that here.';
    return firstBlocker(
      busyReason(state),
      state.character.vitals.energy < def.energyCost &&
        `Needs ${def.energyCost} energy. Nap or eat first.`,
      healthFraction(state) < MIN_HEALTH_TO_TRAIN && 'You are too injured to train.',
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.training.require(action.trainingId);
    const hungry = isHungry(state.character.vitals);
    const before = state.character.stats;
    const stats = applyTraining(before, def.gains, trainingScale(state.character, ctx, hungry));

    let next: GameState = { ...state, character: { ...state.character, stats } };
    next = adjust(spendTime(next, def.slots, ctx), { energy: -def.energyCost });
    return log(next, {
      heading: def.name,
      text: hungry
        ? `${def.description} Your rumbling stomach makes it hard to focus.`
        : def.description,
      tone: 'info',
      chips: [...statChips(diffStats(before, stats)), chip(`−${def.energyCost} energy`, 'cost')],
    });
  },
};

export const eat: ActionHandler<ActionOf<'eat'>> = {
  check(state, action, ctx) {
    const def = ctx.content.foods.get(action.foodId);
    const stall = def && foodStall(state, ctx, def.id);
    if (!def || !stall) return 'That isn’t sold here.';
    const cost = marketPrice(def.cost, state, ctx);
    return firstBlocker(
      busyReason(state),
      closedReason(stall.name, stall.hours, state),
      state.wallet.ryo < cost && `You can’t afford it (${cost} ryo).`,
      state.character.vitals.satiety >= METER_MAX && 'You are completely full.',
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.foods.require(action.foodId);
    const cost = marketPrice(def.cost, state, ctx);
    const paid = spend(state.wallet, cost);
    if (!paid.ok) return state;
    const fed = adjust(
      { ...state, wallet: paid.value },
      { satiety: def.satiety, energy: def.energy },
    );
    return log(spendTime(fed, def.slots, ctx), {
      heading: def.name,
      text: def.description,
      tone: 'info',
      chips: [
        chip(`Fed +${def.satiety}`, 'gain'),
        ...(def.energy > 0 ? [chip(`Energy +${def.energy}`, 'gain')] : []),
        chip(`−${cost} ryo`, 'cost'),
      ],
    });
  },
};

export const rest: ActionHandler<ActionOf<'rest'>> = {
  check(state, _action, ctx) {
    return firstBlocker(
      busyReason(state),
      homeBlocker(state, ctx),
      isRentOverdue(state.housing, state.time.day) && 'The door is locked until you pay rent.',
      state.character.vitals.energy >= METER_MAX && 'You are not tired.',
    );
  },
  perform(state, _action, ctx) {
    return log(adjust(spendTime(state, 1, ctx), { energy: NAP_ENERGY }), {
      heading: 'Nap',
      text: 'You put the kettle on and doze off before it boils.',
      tone: 'info',
      chips: [chip(`Energy +${NAP_ENERGY}`, 'gain')],
    });
  },
};

export const sleep: ActionHandler<ActionOf<'sleep'>> = {
  check(state, _action, ctx) {
    return firstBlocker(busyReason(state), homeBlocker(state, ctx));
  },
  perform(state, _action, ctx) {
    const { text } = ctx.content;
    const lockedOut = isRentOverdue(state.housing, state.time.day);
    const hungry = isHungry(state.character.vitals);
    const full = sleepRecovery(state.character.vitals, state.character.stats);
    const recovery = lockedOut
      ? { ...full, health: Math.round((full.health ?? 0) * LOCKED_OUT_RECOVERY) }
      : full;
    const before = state.character.vitals.health;
    const rested = adjust(spendTime(state, slotsUntilNextMorning(state.time), ctx), recovery);
    const story = lockedOut ? text.sleepLockedOut : hungry ? text.sleepHungry : text.sleepWell;
    const next = log(rested, {
      heading: 'Sleep till dawn',
      text: story,
      tone: lockedOut || hungry ? 'warning' : 'info',
      chips: [
        chip('Energy & chakra restored', 'gain'),
        chip(`Health +${Math.max(0, rested.character.vitals.health - before)}`, 'gain'),
      ],
    });
    return rentReminder(state, next);
  },
};

/** Warns once, on the morning the rent falls due. */
function rentReminder(before: GameState, after: GameState): GameState {
  const wasOverdue = isRentOverdue(before.housing, before.time.day);
  if (wasOverdue || !isRentOverdue(after.housing, after.time.day)) return after;
  return log(after, {
    text: 'A note is pinned to your door: the rent is due.',
    tone: 'warning',
    chips: [chip(`${after.housing.rentPerWeek} ryo / week`, 'cost')],
  });
}
