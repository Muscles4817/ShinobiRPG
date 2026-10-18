import { beatDue, hearBeat } from '../sensei/curriculum';
import type { ActionHandler, ActionOf } from './types';

/** Hears out what your sensei has to show you today (the curriculum). */
export const heedSensei: ActionHandler<ActionOf<'heedSensei'>> = {
  check(state, _action, ctx) {
    return beatDue(state, ctx) ? null : 'Your sensei has nothing to show you today.';
  },
  perform(state, _action, ctx) {
    const beat = beatDue(state, ctx);
    return beat ? hearBeat(state, ctx, beat, true) : state;
  },
};
