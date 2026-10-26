import { ctx, newGame } from '@/test/gameFixtures';

import type { GameState } from '../state';
import { wildHere } from './wild';

const WOODS = 'lantern-woods';

/** Which kind, if any, lives in the woods for each of the first seeds. */
function kindsInTheWoods(start: GameState): (string | undefined)[] {
  return Array.from({ length: 80 }, (_, seed) => {
    const state = { ...start, board: { ...start.board, seed } };
    return wildHere(state, ctx, WOODS)?.id;
  });
}

/** Someone who has fought a mist fox in the deep woods. */
function metAMistFox(): GameState {
  const game = newGame();
  const foes = { ...game.fieldBook.foes, 'mist-fox': { fought: 1, beaten: 0 } };
  return { ...game, fieldBook: { ...game.fieldBook, foes } };
}

describe('companions changed by chakra', () => {
  it('leave no signs for someone who has never met one of their kind', () => {
    expect(kindsInTheWoods(newGame())).not.toContain('mist-fox-kit');
  });

  it('leave signs in some woods once you have fought one', () => {
    const kinds = kindsInTheWoods(metAMistFox());
    expect(kinds).toContain('mist-fox-kit');
    // A wolf's woods stay a wolf's: meeting a fox takes nothing away.
    expect(kinds.filter((k) => k === 'forest-wolf')).toEqual(
      kindsInTheWoods(newGame()).filter((k) => k === 'forest-wolf'),
    );
  });
});
