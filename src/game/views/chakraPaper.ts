import { fillSlots } from '@/core';

import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { findPerson } from '../people/cast';
import { personSlots } from '../people/pronouns';
import type { GameState } from '../state';
import { activeScene } from './peopleScenes';

/** The chakra paper scene: your sensei holds out the paper, and you push your chakra into it. */
export interface ChakraPaperScene {
  readonly heading: string;
  readonly speech: string;
  readonly prompt: string;
  readonly test: GameAction;
}

/** Your sensei, when there is no telling who. */
const ANY_SENSEI = { id: 'sensei', name: 'your sensei', pronouns: 'they' } as const;

export function chakraPaperScene(state: GameState, ctx: GameContext): ChakraPaperScene | null {
  if (activeScene(state) !== 'chakra-paper') return null;
  const sensei = findPerson(state, ctx, state.people.team?.senseiId ?? '');
  const text = ctx.content.text.chakraPaper;
  return {
    heading: text.heading,
    speech: fillSlots(text.speech, personSlots('sensei', sensei ?? ANY_SENSEI)),
    prompt: text.prompt,
    test: { type: 'testChakraPaper' },
  };
}
