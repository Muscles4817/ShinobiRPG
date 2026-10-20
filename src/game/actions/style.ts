import { CHAINS_KEPT } from '@/systems/combat';

import { chainBlocker, chainIds, fitsStyle, styleMoveIds, styleRoom } from '../style';
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

/** Keeping a chain you built: every link must follow the last (`rules/chains.ts`). */
export const keepChain: ActionHandler<ActionOf<'keepChain'>> = {
  check(state, action, ctx) {
    const problem = chainBlocker(state, ctx, action.techniqueIds);
    if (problem) return problem;
    const chains = chainIds(state, ctx);
    const key = action.techniqueIds.join('>');
    if (chains.some((c) => c.join('>') === key)) return 'You already keep that chain.';
    return chains.length >= CHAINS_KEPT
      ? `You keep ${CHAINS_KEPT} chains at most. Drop one first.`
      : null;
  },
  perform(state, action, ctx) {
    const chains = [...chainIds(state, ctx), action.techniqueIds];
    return { ...state, techniques: { ...state.techniques, chains } };
  },
};

/** Dropping one of the chains you keep. */
export const dropChain: ActionHandler<ActionOf<'dropChain'>> = {
  check(state, action, ctx) {
    return chainIds(state, ctx)[action.index] ? null : 'There is no such chain.';
  },
  perform(state, action, ctx) {
    const chains = chainIds(state, ctx).filter((_, i) => i !== action.index);
    return { ...state, techniques: { ...state.techniques, chains } };
  },
};

/** Letting fights build your chains from what you know again. */
export const resetChains: ActionHandler<ActionOf<'resetChains'>> = {
  check(state) {
    return state.techniques.chains === null ? 'Your chains are already built for you.' : null;
  },
  perform(state) {
    return { ...state, techniques: { ...state.techniques, chains: null } };
  },
};
