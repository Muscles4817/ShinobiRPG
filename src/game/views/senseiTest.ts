import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { fillTest, KNOW_IT, SHOW_ME, testOf } from '../sensei/opening';
import { mentorOf } from '../sensei/plan';
import type { GameState } from '../state';
import { activeScene } from './peopleScenes';

/** The first meeting with your sensei as a scene: their test round by round, then one question. */
export interface SenseiTestScene {
  readonly heading: string;
  /** Story lines: how it began, what came of your last choice, and what now. */
  readonly lines: readonly string[];
  readonly choices: readonly { readonly label: string; readonly action: GameAction }[];
}

const ASK = '“Now. Do you want me to show you how things work here, or do you know?”';
const FIRST_MEETING = '{sensei} finds the three of you at the training ground.';

export function senseiTestScene(state: GameState, ctx: GameContext): SenseiTestScene | null {
  const sensei = mentorOf(state, ctx);
  const opening = state.mentor.opening;
  if (activeScene(state) !== 'sensei-test' || !sensei || !opening) return null;
  const test = testOf(ctx, sensei);
  const fill = (text: string) => fillTest(state, ctx, sensei, text);
  const round = test?.rounds[opening.round];
  const begun = opening.round === 0 ? [fill(test?.intro ?? FIRST_MEETING)] : [];
  const last = opening.lastResult ? [opening.lastResult] : [];
  const pick = (optionIndex: number): GameAction => ({ type: 'senseiTest', optionIndex });
  if (round) {
    return {
      heading: test.title,
      lines: [...begun, ...last, fill(round.prompt)],
      choices: round.options.map((o, i) => ({ label: fill(o.label), action: pick(i) })),
    };
  }
  return {
    heading: test?.title ?? `Meeting ${sensei.name}`,
    lines: [...begun, ...last, ...(test ? [fill(test.close)] : []), ASK],
    choices: [
      { label: SHOW_ME, action: pick(0) },
      { label: KNOW_IT, action: pick(1) },
    ],
  };
}
