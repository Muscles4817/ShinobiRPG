import { fitsStyle, styleMoveIds, styleRoom } from '../style';
import type { ActionHandler, ActionOf } from './types';

/** Putting a body move you know into your style, or taking it out. Changes nothing in the world. */
export const setStyleMove: ActionHandler<ActionOf<'setStyleMove'>> = {
  check(state, action, ctx) {
    const def = ctx.content.techniques.get(action.techniqueId);
    if (!def || !state.techniques.known.includes(def.id)) return 'You don’t know that technique.';
    if (!fitsStyle(def)) return 'Only plain body moves that strike make up a style.';
    const moves = styleMoveIds(state, ctx);
    if (moves.includes(def.id) === action.inStyle) {
      return action.inStyle ? 'It is already part of your style.' : 'It isn’t part of your style.';
    }
    if (action.inStyle && moves.length >= styleRoom(state)) {
      return `Your style holds ${styleRoom(state)} moves at your taijutsu grade. Take one out first.`;
    }
    return null;
  },
  perform(state, action, ctx) {
    const moves = styleMoveIds(state, ctx);
    const repertoire = action.inStyle
      ? [...moves, action.techniqueId]
      : moves.filter((id) => id !== action.techniqueId);
    return { ...state, techniques: { ...state.techniques, repertoire } };
  },
};

/** Letting fights keep your best moves again, as they do until you choose. */
export const resetStyle: ActionHandler<ActionOf<'resetStyle'>> = {
  check(state) {
    return state.techniques.repertoire === null
      ? 'Your style already keeps your best moves.'
      : null;
  },
  perform(state) {
    return { ...state, techniques: { ...state.techniques, repertoire: null } };
  },
};
