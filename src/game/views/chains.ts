import { BODY_ARTS, chainLength, isBodyArt } from '@/systems/combat';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { chainIds, chainLinks, fitsChainLink } from '../style';
import { choice, type Choice } from './common';

/**
 * Your chains on the Jutsu tab: the ones a strike may open (as you built them, or built for
 * you), and a builder that says, before you keep one, whether each link follows the last.
 */

export interface ChainLine {
  /** "Post Sweep into Crescent Drop". */
  readonly text: string;
  readonly drop: Choice;
}

export interface ChainsView {
  /** No chains yet: neither art is at grade C. */
  readonly locked: boolean;
  /** The most links a chain may have, in your best art for chains. */
  readonly length: number;
  readonly chains: readonly ChainLine[];
  /** You built them; otherwise they are built for you from what you know. */
  readonly chosen: boolean;
  readonly reset: Choice;
  /** The body moves and weapon forms you know that a chain can hold, for the builder. */
  readonly moves: readonly { readonly id: string; readonly name: string }[];
}

/** A chain being built: how it reads, and keeping it (its blocker says what would break it). */
export interface ChainDraft {
  readonly text: string;
  readonly keep: Choice;
}

function chainText(ids: readonly string[], ctx: GameContext): string {
  return chainLinks(ids, ctx)
    .map((t) => t.name)
    .join(' into ');
}

/** Your chains, or null while you know no move a chain could hold. */
export function chainsView(state: GameState, ctx: GameContext): ChainsView | null {
  const known = state.techniques.known.flatMap((id) => {
    const def = ctx.content.techniques.get(id);
    return def && fitsChainLink(def) ? [def] : [];
  });
  if (known.length === 0) return null;
  const lengthIn = (art: string) => (isBodyArt(art) ? chainLength(state.character.stats[art]) : 0);
  const moves = known
    .filter((def) => lengthIn(def.discipline) >= 2)
    .map((def) => ({ id: def.id, name: def.name }));
  const length = Math.max(0, ...BODY_ARTS.map(lengthIn));
  return {
    locked: length < 2,
    length,
    chains: chainIds(state, ctx).map((ids, index) => ({
      text: chainText(ids, ctx),
      drop: choice(state, ctx, { type: 'dropChain', index }),
    })),
    chosen: state.techniques.chains !== null,
    reset: choice(state, ctx, { type: 'resetChains' }),
    moves,
  };
}

/** A chain of these moves, as the builder shows it. */
export function chainDraft(state: GameState, ctx: GameContext, ids: readonly string[]): ChainDraft {
  return {
    text: chainText(ids, ctx),
    keep: choice(state, ctx, { type: 'keepChain', techniqueIds: ids }),
  };
}
