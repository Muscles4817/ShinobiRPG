import { chainLength } from '@/systems/combat';

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
  /** How many links a chain may have at your taijutsu grade (none below C). */
  readonly length: number;
  readonly chains: readonly ChainLine[];
  /** You built them; otherwise they are built for you from what you know. */
  readonly chosen: boolean;
  readonly reset: Choice;
  /** The body moves you know that a chain can hold, for the builder. */
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
  const moves = state.techniques.known.flatMap((id) => {
    const def = ctx.content.techniques.get(id);
    return def && fitsChainLink(def) ? [{ id: def.id, name: def.name }] : [];
  });
  if (moves.length === 0) return null;
  return {
    length: chainLength(state.character.stats.taijutsu),
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
