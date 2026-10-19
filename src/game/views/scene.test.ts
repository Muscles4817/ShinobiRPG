import { ctx, newGame } from '@/test/gameFixtures';

import { fightTechnique } from './scene';
import { jutsuDeck } from './you';

describe('a technique card read in a fight', () => {
  const game = newGame();

  it('reads as its card in the Jutsu deck does', () => {
    const [card] = jutsuDeck(game, ctx);
    expect(fightTechnique(game, ctx, card!.id)).toEqual(card);
  });

  it('is nothing for a technique the pack does not have', () => {
    expect(fightTechnique(game, ctx, 'no-such-technique')).toBeNull();
  });
});
