import { hungerOf, laidUp, type Companion } from '@/systems/companions';
import { applyTraining, diffStats, STAT_INFO, type StatId } from '@/systems/stats';

import { warmed, withCompanion, yourCompanion } from '../companions/care';
import { companionGrowth } from '../companions/routine';
import type { GameContext } from '../context';
import {
  adjust,
  busyReason,
  chip,
  firstBlocker,
  log,
  placeHere,
  spendTime,
  statChips,
} from '../ops';
import { hardWorkEnergy } from '../profile';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/**
 * Training together, at a training place: you drill your companion in one stat as its
 * teacher (the teacher rule: the gap between your grade in it and its own), so a strong
 * handler raises a strong partner. It costs you the slot and the energy, and brings you closer.
 */

const TRAIN_ENERGY = 20;
const TRAIN_SLOTS = 1;
/** A session's work in the chosen stat, before talent, the teacher and limits. */
const SESSION_GAIN = 1.5;
/** Bond a session together is worth. */
const SESSION_BOND = 2;

/** The stats a companion can be drilled in: any it has a talent for. */
export function trainableStats(companion: Companion): StatId[] {
  return (Object.keys(companion.aptitude) as StatId[]).filter(
    (id) => id !== 'reserves' && companion.aptitude[id] > 0,
  );
}

function blocker(state: GameState, ctx: GameContext, stat: StatId): string | null {
  const yours = yourCompanion(state, ctx);
  if (!yours) return 'You have no companion.';
  const { companion } = yours;
  const hunger = hungerOf(companion, state.time.day);
  const energy = hardWorkEnergy(state.character, ctx, TRAIN_ENERGY);
  return firstBlocker(
    busyReason(state),
    !placeHere(state, ctx, 'training') && 'Find a training ground to train together.',
    laidUp(companion, state.time.day) && `${companion.name} is laid up. Let it heal first.`,
    (hunger === 'hungry' || hunger === 'starving') &&
      `${companion.name} is too hungry. Feed it first.`,
    !trainableStats(companion).includes(stat) && `${companion.name} can’t learn that.`,
    state.character.vitals.energy < energy && `Needs ${energy} energy. Nap or eat first.`,
  );
}

export const trainCompanion: ActionHandler<ActionOf<'trainCompanion'>> = {
  check(state, { stat }, ctx) {
    return blocker(state, ctx, stat);
  },
  perform(state, { stat }, ctx) {
    const yours = yourCompanion(state, ctx);
    if (!yours) return state;
    const { companion, kind } = yours;
    const teacher = state.character.stats[stat];
    const growth = {
      ...companionGrowth(companion, kind.temperament),
      teachers: { [stat]: teacher },
    };
    const stats = applyTraining(companion.stats, { [stat]: SESSION_GAIN }, growth);
    const trained = { ...warmed(companion, kind, SESSION_BOND), stats };
    const energy = hardWorkEnergy(state.character, ctx, TRAIN_ENERGY);
    const worked = adjust(spendTime(withCompanion(state, trained), TRAIN_SLOTS, ctx), {
      energy: -energy,
    });
    return log(worked, {
      heading: `Training with ${companion.name}`,
      text: `You drill ${companion.name} in ${STAT_INFO[stat].label.toLowerCase()} until you’re both spent.`,
      tone: 'success',
      chips: [...statChips(diffStats(companion.stats, stats)), chip(`−${energy} energy`, 'cost')],
    });
  },
};
