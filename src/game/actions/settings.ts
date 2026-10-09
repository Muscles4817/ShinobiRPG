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
