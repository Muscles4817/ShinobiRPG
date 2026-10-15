import { log } from '../ops';
import { beatDue, HEEDED_REGARD } from '../sensei/curriculum';
import { mentorOf } from '../sensei/plan';
import { withRegard } from '../sensei/state';
import type { ActionHandler, ActionOf } from './types';

/** Hears out what your sensei has to show you today (the curriculum). */
export const heedSensei: ActionHandler<ActionOf<'heedSensei'>> = {
  check(state, _action, ctx) {
    return beatDue(state, ctx) ? null : 'Your sensei has nothing to show you today.';
  },
  perform(state, _action, ctx) {
    const beat = beatDue(state, ctx);
    const sensei = mentorOf(state, ctx);
    if (!beat || !sensei) return state;
    const mentor = withRegard(
      { ...state.mentor, beats: [...state.mentor.beats, beat.id], lastBeatDay: state.time.day },
      HEEDED_REGARD,
    );
    return log(
      { ...state, mentor },
      { heading: beat.title, text: beat.text.replaceAll('{sensei}', sensei.name), tone: 'info' },
    );
  },
};
