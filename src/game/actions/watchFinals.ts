import { watchBlocker, watchFinals as intoTheStands } from '../exam/spectators';
import { busyReason, firstBlocker } from '../ops';
import type { ActionHandler, ActionOf } from './types';

/** An afternoon in the stands, watching an exam's finals (`exam/spectators.ts`). */
export const watchFinals: ActionHandler<ActionOf<'watchFinals'>> = {
  check(state, _action, ctx) {
    return firstBlocker(busyReason(state), watchBlocker(state, ctx));
  },
  perform(state, _action, ctx, rng) {
    return intoTheStands(state, ctx, rng);
  },
};
