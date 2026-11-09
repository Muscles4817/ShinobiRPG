import type { GameState } from '../state';
import { activeScene } from './peopleScenes';

/**
 * What a story scene is about, for the panel the desktop layout keeps beside it: the job under
 * way (an encounter on a mission), the person you are facing (a talk, a rival's moment, a race),
 * or yourself (the scenes that are about you: an exam, a ceremony, team assignment, the chakra
 * paper, your sensei's test). The mission and the fight lay out their own panes, so they have
 * none here.
 */
export type SceneBeside =
  | { readonly kind: 'job' }
  | { readonly kind: 'person'; readonly personId: string }
  | { readonly kind: 'you' };

const YOU: SceneBeside = { kind: 'you' };

function rivalBeside(state: GameState): SceneBeside {
  return state.rival ? { kind: 'person', personId: state.rival.personId } : YOU;
}

export function sceneBeside(state: GameState): SceneBeside | null {
  const scene = activeScene(state);
  switch (scene) {
    case null:
    case 'combat':
    case 'mission':
    case 'journey':
      return null;
    case 'encounter':
      return { kind: 'job' };
    case 'conversation': {
      const talking = state.people.conversation;
      return talking ? { kind: 'person', personId: talking.personId } : YOU;
    }
    case 'rival':
    case 'race':
      return rivalBeside(state);
    case 'exam':
    case 'promotion':
    case 'team':
    case 'chakra-paper':
    case 'sensei-test':
      return YOU;
  }
}
