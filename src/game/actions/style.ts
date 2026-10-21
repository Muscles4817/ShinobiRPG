import { BODY_ARTS, CHAINS_KEPT, isBodyArt } from '@/systems/combat';

import {
  chainBlocker,
  chainIds,
  chainRoomFor,
  styleArtOf,
  styleMoveIdsIn,
  styleRoom,
} from '../style';
import type { ActionHandler, ActionOf } from './types';

/** Putting a body move you know into your style, or taking it out. Changes nothing in the world. */
export const setStyleMove: ActionHandler<ActionOf<'setStyleMove'>> = {
  check(state, action, ctx) {
    const def = ctx.content.techniques.get(action.techniqueId);
    if (!def || !state.techniques.known.includes(def.id)) return 'You don’t know that technique.';
    const art = styleArtOf(def);
    if (!art) return 'Only plain body moves and weapon forms that strike make up a style.';
    const moves = styleMoveIdsIn(state, ctx, art);
    if (moves.includes(def.id) === action.inStyle) {
      return action.inStyle ? 'It is already part of your style.' : 'It isn’t part of your style.';
    }
    const room = styleRoom(state, art);
    if (action.inStyle && moves.length >= room) {
      return `Your style holds ${room} moves at your ${art} grade. Take one out first.`;
    }
    return null;
  },
  perform(state, action, ctx) {
    const art = ctx.content.techniques.get(action.techniqueId)?.discipline;
    // Each art's moves as they stand now (chosen or best), with this one put in or taken out.
    const others = BODY_ARTS.filter((a) => a !== art).flatMap((a) => styleMoveIdsIn(state, ctx, a));
    const mine = art && isBodyArt(art) ? styleMoveIdsIn(state, ctx, art) : [];
    const changed = action.inStyle
      ? [...mine, action.techniqueId]
      : mine.filter((id) => id !== action.techniqueId);
    const repertoire = [...others, ...changed];
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
    const key = action.techniqueIds.join('>');
    if (chainIds(state, ctx).some((c) => c.join('>') === key))
      return 'You already keep that chain.';
    return chainRoomFor(state, ctx, action.techniqueIds)
      ? null
      : `You keep ${CHAINS_KEPT} chains in an art at most. Drop one first.`;
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
