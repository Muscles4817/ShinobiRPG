import type { GameContext } from '../context';
import { DAY_END_MODES, type DayEndMode } from '../daybook/state';
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

/** What the end of a day shows, as a choice in the settings. */
export interface DayEndOption extends Choice {
  readonly mode: DayEndMode;
  readonly name: string;
  readonly blurb: string;
  readonly on: boolean;
}

const DAY_END_TEXT: Readonly<Record<DayEndMode, { name: string; blurb: string }>> = {
  full: {
    name: 'The full day',
    blurb: 'At the end of each day: what grew, who you saw, and tomorrow.',
  },
  brief: {
    name: 'A morning slip',
    blurb: 'Nothing at night. Next morning, a slip above the village.',
  },
  off: { name: 'Nothing', blurb: 'Days end quietly. Your record still keeps everything.' },
};

export function dayEndOptions(state: GameState, ctx: GameContext): readonly DayEndOption[] {
  const current = state.settings.dayEnd ?? 'full';
  return DAY_END_MODES.map((mode) => ({
    ...choice(state, ctx, { type: 'setDayEnd', mode }),
    mode,
    ...DAY_END_TEXT[mode],
    on: mode === current,
  }));
}
