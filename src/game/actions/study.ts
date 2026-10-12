import { STAT_INFO } from '@/systems/stats';
import { learnBlocker, study as studyTechnique } from '@/systems/techniques';

import { discover, logDiscoveries, noTalentReason } from '../growth';
import { studyPointsFor } from '../profile';
import { adjust, busyReason, chip, firstBlocker, log, placeHere, spendTime } from '../ops';
import { closedReason } from '../village';
import type { ActionHandler, ActionOf } from './types';

export const STUDY_ENERGY_COST = 15;
export const STUDY_SLOTS = 1;

export const study: ActionHandler<ActionOf<'study'>> = {
  check(state, action, ctx) {
    const def = ctx.content.techniques.get(action.techniqueId);
    const academy = placeHere(state, ctx, 'academy');
    if (!def || !academy?.techniqueIds.includes(def.id)) return 'That scroll isn’t kept here.';
    const { character } = state;
    const blocker = learnBlocker(state.techniques, def, character.stats, character.clanId);
    return firstBlocker(
      busyReason(state),
      noTalentReason(character, def.discipline, ctx),
      closedReason(academy.name, academy.hours, state),
      blocker?.kind === 'already-known' && 'You already know this technique.',
      blocker?.kind === 'clan' && 'Only taught within its clan.',
      blocker?.kind === 'requirements' &&
        `Needs better ${blocker.unmet.map((id) => STAT_INFO[id].label).join(', ')}.`,
      state.character.vitals.energy < STUDY_ENERGY_COST && `Needs ${STUDY_ENERGY_COST} energy.`,
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.techniques.require(action.techniqueId);
    const { character } = state;
    const talent = character.aptitude[def.discipline] > 0;
    const points = talent ? studyPointsFor(character, def, ctx) : 0;
    const result = studyTechnique(state.techniques, def, points);
    const practised = discover(character, { [def.discipline]: 1 });
    const studied = { ...state, techniques: result.book, character: practised.character };
    const next = adjust(spendTime(studied, STUDY_SLOTS, ctx), { energy: -STUDY_ENERGY_COST });
    const pct = Math.round((result.progress / def.difficulty) * 100);
    const logged = log(next, {
      heading: `Study ${def.name}`,
      text: result.mastered
        ? `It finally clicks. ${def.name} is yours.`
        : 'You unroll the scroll a little further and practise until your hands ache.',
      tone: result.mastered ? 'success' : 'info',
      chips: [
        chip(result.mastered ? 'Mastered' : `${pct}% learned`, 'gain'),
        chip(`−${STUDY_ENERGY_COST} energy`, 'cost'),
      ],
    });
    return logDiscoveries(logged, practised.discovered, ctx);
  },
};
