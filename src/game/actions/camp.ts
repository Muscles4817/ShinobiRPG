import { isHungry } from '@/systems/vitals';

import { CAMP_NIGHTS } from '../everyday/awayLines';
import { tellDaily } from '../everyday/tell';
import { busyReason, chip, firstBlocker, placeHere } from '../ops';
import { placeInSentence } from '../placeName';
import { CAMP_HEALTH_SHARE, eatFromPack } from '../road';
import { sleepTillDawn } from './daily';
import type { ActionHandler, ActionOf } from './types';

/**
 * A night in camp in wild country or at a landmark, where there is no inn: supper from your
 * pack by the fire, if there's anything in it, and a night under the sky that heals what a night
 * on the road does.
 */
export const makeCamp: ActionHandler<ActionOf<'makeCamp'>> = {
  check(state, _action, ctx) {
    const camp = placeHere(state, ctx, 'camp');
    return firstBlocker(busyReason(state), !camp && 'There is nowhere to make camp here.');
  },
  perform(state, _action, ctx) {
    const camp = placeHere(state, ctx, 'camp');
    if (!camp) return state;
    const supper = eatFromPack(state, ctx);
    const said = tellDaily(supper.state, ctx, CAMP_NIGHTS, { key: camp.id });
    return sleepTillDawn({ ...supper.state, told: said.told }, ctx, {
      healthShare: CAMP_HEALTH_SHARE,
      text: said.text,
      uneasy: isHungry(supper.state.character.vitals),
      heading: `Camp at ${placeInSentence(camp)}`,
      chips: supper.ate ? [chip('Supper from your pack', 'cost')] : [],
    });
  },
};
