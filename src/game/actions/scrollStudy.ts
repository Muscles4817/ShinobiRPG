import { ownsScroll } from '@/systems/inventory';

import { busyReason, firstBlocker } from '../ops';
import { readingBlocker } from '../shelves';
import { studyBlocker, studyFrom } from './study';
import type { ActionHandler, ActionOf } from './types';

/**
 * Studying a scroll you own (a mission's reward, a gift), at home or in a library you may use.
 * It is a bare scroll, so it teaches at the scroll's pace, by the same gate as every source.
 */
export const studyScroll: ActionHandler<ActionOf<'studyScroll'>> = {
  check(state, action, ctx) {
    const def = ctx.content.techniques.get(action.techniqueId);
    if (!def || !ownsScroll(state.inventory, action.techniqueId)) {
      return 'You don’t have that scroll.';
    }
    return firstBlocker(
      busyReason(state),
      readingBlocker(state, ctx),
      studyBlocker(state, def, ctx),
    );
  },
  perform(state, action, ctx) {
    return studyFrom(state, ctx.content.techniques.require(action.techniqueId), ctx, 'scroll');
  },
};
