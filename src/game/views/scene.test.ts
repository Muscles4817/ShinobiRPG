import { ctx, newGame } from '@/test/gameFixtures';

import { fightTechnique } from './scene';
import { jutsuDeck } from './you';

describe('a technique card read in a fight', () => {
  const game = newGame();

  it('reads as its card in the Jutsu deck does', () => {
    // The same card, without your style's choice: that is the deck's alone.
    const { style: _style, ...card } = jutsuDeck(game, ctx)[0]!;
    expect(fightTechnique(game, ctx, card.id)).toEqual(card);
  });

  it('reads a technique you fight with as known, though your character never learned it', () => {
    // A versus sandbox fights with its fighter's kit, which its fresh character never studied.
    const unlearned = jutsuDeck(game, ctx).find((c) => c.status === 'unknown')!;
    const card = fightTechnique(game, ctx, unlearned.id)!;
    expect(card.status).toBe('known');
    expect(card.name).toBe(unlearned.name);
  });

  it('is nothing for a technique the pack does not have', () => {
    expect(fightTechnique(game, ctx, 'no-such-technique')).toBeNull();
  });
});
