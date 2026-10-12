import { discover, logDiscoveries, noTalentReason } from '../growth';
import { learnBlockerFor, learnBlockerText, studySession, type Studied } from '../learning';
import { adjust, busyReason, chip, firstBlocker, log, placeHere, spendTime } from '../ops';
import { closedReason } from '../village';
import type { ActionHandler, ActionOf } from './types';

export const STUDY_ENERGY_COST = 15;
export const STUDY_SLOTS = 1;

function masteryLine(name: string, result: Studied): string {
  if (!result.mastered) {
    return 'You unroll the scroll a little further and practise until your hands ache.';
  }
  return result.unstable
    ? `${name} is yours, just. It is beyond your grade and fights your chakra; it will steady as you grow.`
    : `It finally clicks. ${name} is yours.`;
}

export const study: ActionHandler<ActionOf<'study'>> = {
  check(state, action, ctx) {
    const def = ctx.content.techniques.get(action.techniqueId);
    const academy = placeHere(state, ctx, 'academy');
    if (!def || !academy?.techniqueIds.includes(def.id)) return 'That scroll isn’t kept here.';
    const blocker = learnBlockerFor(state, def, ctx);
    return firstBlocker(
      busyReason(state),
      noTalentReason(state.character, def.discipline, ctx),
      closedReason(academy.name, academy.hours, state),
      blocker && learnBlockerText(blocker, def),
      state.character.vitals.energy < STUDY_ENERGY_COST && `Needs ${STUDY_ENERGY_COST} energy.`,
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.techniques.require(action.techniqueId);
    const result = studySession(state, def, ctx, 'scroll');
    const practised = discover(state.character, { [def.discipline]: 1 });
    const studied = { ...state, techniques: result.book, character: practised.character };
    const next = adjust(spendTime(studied, STUDY_SLOTS, ctx), { energy: -STUDY_ENERGY_COST });
    const logged = log(next, {
      heading: `Study ${def.name}`,
      text: masteryLine(def.name, result),
      tone: result.mastered ? 'success' : 'info',
      chips: [
        chip(result.mastered ? 'Mastered' : `${result.percent}% learned`, 'gain'),
        ...(result.unstable ? [chip('Unstable', 'cost')] : []),
        chip(`−${STUDY_ENERGY_COST} energy`, 'cost'),
      ],
    });
    return logDiscoveries(logged, practised.discovered, ctx);
  },
};
