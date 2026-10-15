import type { GameContext } from '../context';
import { DEFAULT_MAP_STYLE, MAP_STYLE_TEXT, MAP_STYLES, type MapStyle } from '../mapStyle';
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

/** One way to ink the Travel map, as a choice in the settings. */
export interface MapStyleOption extends Choice {
  readonly style: MapStyle;
  readonly name: string;
  readonly blurb: string;
  readonly on: boolean;
}

export function mapStyleOptions(state: GameState, ctx: GameContext): readonly MapStyleOption[] {
  const current = state.settings.mapStyle ?? DEFAULT_MAP_STYLE;
  return MAP_STYLES.map((style) => ({
    ...choice(state, ctx, { type: 'setMapStyle', style }),
    style,
    ...MAP_STYLE_TEXT[style],
    on: style === current,
  }));
}
