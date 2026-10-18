import { isRentOverdue, ownsHouse } from '@/systems/housing';
import { diffStats, type StatDelta, type StatId } from '@/systems/stats';
import { slotsUntilNextMorning } from '@/systems/time';
import { isHungry, maxChakra, METER_MAX, sleepRecovery, type VitalsDelta } from '@/systems/vitals';
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
import { weakFromHunger } from '../hunger';
import { laidUp, mendedOvernight, sleepChakra } from '../injuries';
import type { GameContext } from '../context';
import { atHome, comforts, currentHome, hasRoom } from '../home/home';
import { byTheClock, growCharacter, logDiscoveries, noTalentReason } from '../growth';
import { characterModifiers, hardWorkEnergy } from '../profile';
import type { GameState } from '../state';
import { closedReason, foodSellersHere, isOpen, marketPrice } from '../village';
import type { ActionHandler, ActionOf } from './types';

/** Everyday life in a village: training, eating, napping and sleeping. */

const NAP_ENERGY = 30;
const MIN_HEALTH_TO_TRAIN = 0.2;
const LOCKED_OUT_RECOVERY = 0.4;

/** Drills in your own yard cost this share of the energy: no walk there and back. */
const YARD_ENERGY = 0.85;

function offeredHere(state: GameState, ctx: GameContext) {
  return {
    training: (id: string) => placeHere(state, ctx, 'training')?.trainingIds.includes(id) ?? false,
    yard: (id: string) =>
      atHome(state, ctx) &&
      hasRoom(state, ctx, 'yard') &&
      (currentHome(state, ctx).def?.yardTrainingIds?.includes(id) ?? false),
  };
}

/** A drill's energy: as usual, or less in your own yard. */
function drillEnergy(state: GameState, ctx: GameContext, base: number, yard: boolean): number {
  const energy = hardWorkEnergy(state.character, ctx, base);
  return yard ? Math.round(energy * YARD_ENERGY) : energy;
}

/** The stall or izakaya here selling this food, preferring one that is open now. */
function foodStall(state: GameState, ctx: GameContext, foodId: string) {
  const stalls = foodSellersHere(state, ctx).filter((s) => s.foodIds.includes(foodId));
  return stalls.find((s) => isOpen(s.hours, state)) ?? stalls[0];
}

/** Whether you are at the home you rent (where the rent, and the landlord, are). */
export function atRentedHome(state: GameState, ctx: GameContext): boolean {
  return placeHere(state, ctx, 'home')?.id === state.housing.placeId;
}

/** Why the character can't use a home here (the one they rent, or a house they own), or null. */
export function homeBlocker(state: GameState, ctx: GameContext): string | null {
  if (atRentedHome(state, ctx)) return null;
  const house = placeHere(state, ctx, 'house');
  if (house && ownsHouse(state.housing, house.id)) return null;
  return 'Your home is not in this village.';
}

/** Locked out of the home you rent: only there, and only while the rent is overdue. */
function lockedOut(state: GameState, ctx: GameContext): boolean {
  return atRentedHome(state, ctx) && isRentOverdue(state.housing, state.time.day);
}

/** The stat a drill is mainly for: its largest gain. */
export function mainStat(gains: StatDelta): StatId | undefined {
  const entries = Object.entries(gains) as [StatId, number][];
  return entries.reduce<[StatId, number] | undefined>(
    (best, entry) => (!best || entry[1] > best[1] ? entry : best),
    undefined,
  )?.[0];
}

export const train: ActionHandler<ActionOf<'train'>> = {
  check(state, action, ctx) {
    const def = ctx.content.training.get(action.trainingId);
    const here = offeredHere(state, ctx);
    const yard = action.yard === true;
    if (!def || !(yard ? here.yard(def.id) : here.training(def.id))) {
      return 'You can’t train that here.';
    }
    const main = mainStat(def.gains);
    const energy = drillEnergy(state, ctx, def.energyCost, yard);
    return firstBlocker(
      busyReason(state),
      main !== undefined && noTalentReason(state.character, main, ctx),
      weakFromHunger(state),
      laidUp(state, ctx),
      state.character.vitals.energy < energy && `Needs ${energy} energy. Nap or eat first.`,
      healthFraction(state) < MIN_HEALTH_TO_TRAIN && 'You are too injured to train.',
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.training.require(action.trainingId);
    const hungry = isHungry(state.character.vitals);
    const energy = drillEnergy(state, ctx, def.energyCost, action.yard === true);
    const before = state.character.stats;
    const grown = growCharacter(state.character, byTheClock(state, ctx, def.gains), ctx);
    const { stats } = grown.character;

    let next: GameState = { ...state, character: grown.character };
    next = adjust(spendTime(next, def.slots, ctx), { energy: -energy });
    const logged = log(next, {
      heading: def.name,
      text: hungry
        ? `${def.description} Your rumbling stomach makes it hard to focus.`
        : def.description,
      tone: 'info',
      chips: [...statChips(diffStats(before, stats)), chip(`−${energy} energy`, 'cost')],
    });
    return logDiscoveries(logged, grown.discovered, ctx);
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
        chip(`Hunger −${def.satiety}`, 'gain'),
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
      lockedOut(state, ctx) && 'The door is locked until you pay rent.',
      state.character.vitals.energy >= METER_MAX && 'You are not tired.',
    );
  },
  perform(state, _action, ctx) {
    const energy = NAP_ENERGY + comforts(state, ctx).nap;
    return log(adjust(spendTime(state, 1, ctx), { energy }), {
      heading: 'Nap',
      text: 'You put the kettle on and doze off before it boils.',
      tone: 'info',
      chips: [chip(`Energy +${energy}`, 'gain')],
    });
  },
};

export const sleep: ActionHandler<ActionOf<'sleep'>> = {
  check(state, _action, ctx) {
    return firstBlocker(busyReason(state), homeBlocker(state, ctx));
  },
  perform(state, _action, ctx) {
    const { text } = ctx.content;
    const locked = lockedOut(state, ctx);
    const hungry = isHungry(state.character.vitals);
    const story = locked ? text.sleepLockedOut : hungry ? text.sleepHungry : text.sleepWell;
    const next = sleepTillDawn(state, ctx, {
      healthShare: locked ? LOCKED_OUT_RECOVERY : 1,
      text: story,
      uneasy: locked || hungry,
    });
    return rentReminder(state, next);
  },
};

/** How a night went: how much of a night in your own bed it heals, and the line for it. */
export interface Night {
  readonly healthShare: number;
  readonly text: string;
  /** A rough night (hungry, locked out): the log says so. */
  readonly uneasy: boolean;
}

/** To the next morning in a bed: energy and chakra back, and some health. */
export function sleepTillDawn(state: GameState, ctx: GameContext, night: Night): GameState {
  const chakra = sleepChakra(state);
  const full = nightsRest(state, ctx);
  const recovery = { ...full, health: Math.round((full.health ?? 0) * night.healthShare) };
  const before = state.character.vitals.health;
  const mended = mendedOvernight(state, characterModifiers(state.character, ctx).injuryNights);
  const rested = adjust(spendTime(mended, slotsUntilNextMorning(state.time), ctx), recovery);
  return log(rested, {
    heading: 'Sleep till dawn',
    text: night.text,
    tone: night.uneasy ? 'warning' : 'info',
    chips: [
      chip(chakra.partial ? 'Energy restored' : 'Energy & chakra restored', 'gain'),
      ...(chakra.partial ? [chip('Chakra only partly back', 'cost')] : []),
      chip(`Health +${Math.max(0, rested.character.vitals.health - before)}`, 'gain'),
    ],
  });
}

/**
 * What a night in your own bed gives back: energy, health (more after a restful meal) and
 * chakra (only part of it while exhausted, though a restful meal eases that too).
 */
function nightsRest(state: GameState, ctx: GameContext): VitalsDelta {
  const { vitals, stats } = state.character;
  // A good bed at home heals more on top of whatever else helps (`comforts`).
  const sleepHealing =
    characterModifiers(state.character, ctx).sleepHealing * comforts(state, ctx).sleep;
  const base = sleepRecovery(vitals, stats);
  const night = sleepChakra(state);
  const emptied = maxChakra(stats) - vitals.chakra;
  return {
    ...base,
    health: Math.round((base.health ?? 0) * sleepHealing),
    chakra: night.partial
      ? Math.min(emptied, Math.round(night.chakra * sleepHealing))
      : night.chakra,
  };
}

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
