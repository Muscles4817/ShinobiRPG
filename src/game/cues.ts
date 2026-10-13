import type { GameAction, GameActionType } from './actions/types';
import type { GameState } from './state';

/**
 * Which small animation an everyday action plays once it has happened: steam off a bowl, a
 * pot on the boil, ink strokes for training. The game decides it (so a headless test can check
 * it); the screen only draws it, and only when the player has animations on.
 */

export const ACTION_CUES = ['eat', 'cook', 'sleep', 'rest', 'train', 'study', 'heal'] as const;
export type ActionCue = (typeof ACTION_CUES)[number];

const CUE_FOR: Readonly<Partial<Record<GameActionType, ActionCue>>> = {
  eat: 'eat',
  cook: 'cook',
  hostDinner: 'cook',
  sleep: 'sleep',
  rest: 'rest',
  train: 'train',
  trainWith: 'train',
  study: 'study',
  studyScroll: 'study',
  treat: 'heal',
};

/** The cue for an action that went through, or null (none for it, or animations off). */
export function cueAfter(action: GameAction, after: GameState): ActionCue | null {
  if (!after.settings.animations) return null;
  return CUE_FOR[action.type] ?? null;
}
