import { GROWN_ONLY, hungerOf, laidUp, type Companion } from '@/systems/companions';
import { diffStats, STAT_INFO, type StatId } from '@/systems/stats';

import { warmed, withCompanion, yourCompanion } from '../companions/care';
import { drilledStats, ownerHandling } from '../companions/drill';
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
 * Training together, at a training place: you drill your companion in one of its skills as its
 * handler (`companions/drill.ts`): how well you handle it, not how good you are at the skill
 * yourself, so a fresh genin's hound still learns, and handling lore makes it count more. Its body
 * (strength, speed, stamina) comes with time, never drills. It costs you the slot and the
 * energy; the bond grows from the first session of a day only.
 */

export const TRAIN_ENERGY = 20;
const TRAIN_SLOTS = 1;
/** Bond the day's first session together is worth. */
const SESSION_BOND = 2;

/** The stats a companion can be drilled in: skills it has a talent for, never its body. */
export function trainableStats(companion: Companion): StatId[] {
  return (Object.keys(companion.aptitude) as StatId[]).filter(
    (id) => id !== 'reserves' && !GROWN_ONLY.includes(id) && companion.aptitude[id] > 0,
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
    GROWN_ONLY.includes(stat) &&
      `${companion.name}’s ${STAT_INFO[stat].label.toLowerCase()} comes with time, not drills.`,
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
    const quality = ownerHandling(state, ctx);
    const stats = drilledStats(companion, kind, state.board.seed, { stat, quality });
    const firstToday = companion.lastTrainedDay !== state.time.day;
    const warm = firstToday ? warmed(companion, kind, SESSION_BOND) : companion;
    const trained = {
      ...warm,
      stats,
      lastTrainedDay: state.time.day,
      lastCaredDay: state.time.day,
    };
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
