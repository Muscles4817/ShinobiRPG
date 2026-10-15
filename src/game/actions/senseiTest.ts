import { firstBlocker, log } from '../ops';
import { mentorOf } from '../sensei/plan';
import { answerOpening, testOf } from '../sensei/opening';
import type { ActionHandler, ActionOf } from './types';

/** The first meeting with your sensei: a round of their test, or the last question. */
export const senseiTest: ActionHandler<ActionOf<'senseiTest'>> = {
  check(state, action, ctx) {
    const sensei = mentorOf(state, ctx);
    const opening = state.mentor.opening;
    if (!sensei || !opening) return 'Your sensei isn’t testing you.';
    const round = testOf(ctx, sensei)?.rounds[opening.round];
    const choices = round ? round.options.length : 2;
    return firstBlocker(
      (action.optionIndex < 0 || action.optionIndex >= choices) && 'That isn’t one of the choices.',
    );
  },
  perform(state, action, ctx) {
    const sensei = mentorOf(state, ctx);
    const answered = answerOpening(state, ctx, action.optionIndex);
    if (!answered.closed || !sensei) return answered.state;
    const title = testOf(ctx, sensei)?.title ?? `Meeting ${sensei.name}`;
    return log(answered.state, { heading: title, text: answered.said ?? '', tone: 'success' });
  },
};
