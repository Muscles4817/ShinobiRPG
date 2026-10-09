import { learnBlocker, study as studyTechnique, studyPoints } from '@/systems/techniques';
import { STAT_INFO } from '@/systems/stats';

import { adjust, busyReason, firstBlocker, log, spendTime } from '../ops';
import type { ActionHandler, ActionOf } from './types';

export const STUDY_ENERGY_COST = 15;
export const STUDY_SLOTS = 1;

export const study: ActionHandler<ActionOf<'study'>> = {
  check(state, action, ctx) {
    const def = ctx.content.techniques.get(action.techniqueId);
    if (!def) return 'Unknown technique.';
    const blocker = learnBlocker(state.techniques, def, state.character.stats);
    return firstBlocker(
      busyReason(state),
      blocker?.kind === 'already-known' && 'You already know this technique.',
      blocker?.kind === 'requirements' &&
        `Requires better ${blocker.unmet.map((id) => STAT_INFO[id].label).join(', ')}.`,
      state.character.vitals.energy < STUDY_ENERGY_COST && 'You are too tired to study.',
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.techniques.require(action.techniqueId);
    const points = studyPoints(state.character.stats, def);
    const result = studyTechnique(state.techniques, def, points);
    const next = adjust(spendTime({ ...state, techniques: result.book }, STUDY_SLOTS), {
      energy: -STUDY_ENERGY_COST,
    });
    return result.mastered
      ? log(next, `You have mastered ${def.name}!`, 'success')
      : log(next, `You practise ${def.name} (${result.progress}/${def.difficulty}).`);
  },
};
