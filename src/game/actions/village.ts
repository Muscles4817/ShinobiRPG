import { applyTraining, diffStats } from '@/systems/stats';

import { adjust, busyReason, chip, firstBlocker, log, statChips } from '../ops';
import { hasSight, isNight, sightTonight } from '../village';
import type { ActionHandler, ActionOf } from './types';

/** Following what only your eyes can see through the village at night. */

const SIGHT_ENERGY = 10;

export const followSight: ActionHandler<ActionOf<'followSight'>> = {
  check(state, _action, ctx) {
    return firstBlocker(
      busyReason(state),
      !isNight(state) && 'Spirits only walk at night.',
      !hasSight(state, ctx) && 'Your eyes can’t see what walks the village at night.',
      sightTonight(state, ctx) === null && 'Nothing walks the village tonight.',
      state.village.lastSightDay === state.time.day && 'You’ve already followed it tonight.',
      state.character.vitals.energy < SIGHT_ENERGY && `Needs ${SIGHT_ENERGY} energy.`,
    );
  },
  perform(state, _action, ctx) {
    const sight = sightTonight(state, ctx);
    if (!sight) return state;
    const before = state.character.stats;
    const stats = applyTraining(before, sight.reward);
    const followed = adjust(
      {
        ...state,
        character: { ...state.character, stats },
        village: { ...state.village, lastSightDay: state.time.day },
      },
      { energy: -SIGHT_ENERGY },
    );
    return log(followed, {
      heading: sight.title,
      text: sight.outcome,
      tone: 'success',
      chips: [...statChips(diffStats(before, stats)), chip(`−${SIGHT_ENERGY} energy`, 'cost')],
    });
  },
};
