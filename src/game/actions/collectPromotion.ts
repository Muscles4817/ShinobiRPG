import { collectBlocker, collectPromotion as heldNow } from '../exam/promotionDay';
import type { ActionHandler, ActionOf } from './types';

/** Reporting to the mission hall for a promotion held while you were away. */
export const collectPromotion: ActionHandler<ActionOf<'collectPromotion'>> = {
  check(state, _action, ctx) {
    return collectBlocker(state, ctx);
  },
  perform(state) {
    return heldNow(state);
  },
};
