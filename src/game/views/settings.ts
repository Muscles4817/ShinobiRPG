import type { GameContext } from '../context';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/** The animations switch on the Shinobi tab: whether they are on, and the action that flips it. */
export interface AnimationSetting extends Choice {
  readonly on: boolean;
}

export function animationSetting(state: GameState, ctx: GameContext): AnimationSetting {
  const on = state.settings.animations;
  return { ...choice(state, ctx, { type: 'setAnimations', on: !on }), on };
}
