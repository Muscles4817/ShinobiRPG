import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { findPerson } from '../people/cast';
import type { GameState } from '../state';
import { activeScene } from './peopleScenes';

/** The chakra paper scene: your sensei holds out the paper, and you push your chakra into it. */
export interface ChakraPaperScene {
  readonly heading: string;
  readonly speech: string;
  readonly prompt: string;
  readonly test: GameAction;
}

export function chakraPaperScene(state: GameState, ctx: GameContext): ChakraPaperScene | null {
  if (activeScene(state) !== 'chakra-paper') return null;
  const sensei = findPerson(state, ctx, state.people.team?.senseiId ?? '');
  const text = ctx.content.text.chakraPaper;
  return {
    heading: text.heading,
    speech: text.speech.replaceAll('{sensei}', sensei?.name ?? 'Your sensei'),
    prompt: text.prompt,
    test: { type: 'testChakraPaper' },
  };
}
