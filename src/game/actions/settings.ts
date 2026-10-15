import { DEFAULT_MAP_STYLE, MAP_STYLES } from '../mapStyle';
import type { ActionHandler, ActionOf } from './types';

/** Choosing the fight style for new fights. A fight in progress finishes in its own style. */
export const setCombatStyle: ActionHandler<ActionOf<'setCombatStyle'>> = {
  check(state, action, ctx) {
    if (!ctx.engines.some((e) => e.id === action.style)) return 'Unknown fight style.';
    return state.settings.combatStyle === action.style ? 'This is already your fight style.' : null;
  },
  perform(state, action) {
    return { ...state, settings: { ...state.settings, combatStyle: action.style } };
  },
};

/** Turning the everyday animations on or off. Never busy: it changes nothing in the world. */
export const setAnimations: ActionHandler<ActionOf<'setAnimations'>> = {
  check(state, action) {
    if (state.settings.animations !== action.on) return null;
    return action.on ? 'Animations are already on.' : 'Animations are already off.';
  },
  perform(state, action) {
    return { ...state, settings: { ...state.settings, animations: action.on } };
  },
};

/** Choosing how the Travel map is inked. Never busy: it changes nothing in the world. */
export const setMapStyle: ActionHandler<ActionOf<'setMapStyle'>> = {
  check(state, action) {
    if (!MAP_STYLES.includes(action.style)) return 'Unknown map style.';
    const current = state.settings.mapStyle ?? DEFAULT_MAP_STYLE;
    return current === action.style ? 'The map is already drawn this way.' : null;
  },
  perform(state, action) {
    return { ...state, settings: { ...state.settings, mapStyle: action.style } };
  },
};
