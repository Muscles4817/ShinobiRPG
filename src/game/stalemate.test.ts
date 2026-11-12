import { ctx, newGame } from '@/test/gameFixtures';

import { resolveSpar } from './sparFlow';
import type { GameState } from './state';

/** A fight neither side could finish (`tiring.ts`), as the game reads it. */

function sparring(): GameState {
  const game = newGame();
  const partner = ctx.content.people.all.find((p) => p.role === 'genin')!;
  return { ...game, people: { ...game.people, sparringWith: partner.id } };
}

describe('a stalemate', () => {
  it('ends a spar in a draw: some bond, no winner', () => {
    const state = sparring();
    const { health, chakra } = state.character.vitals;
    const after = resolveSpar(
      state,
      { result: 'stalemate', rounds: 7, player: { health, chakra } },
      ctx,
    );
    const report = after.reports.at(-1);
    expect(report?.kind).toBe('spar');
    expect(report?.kind === 'spar' && report.result).toBe('drawn');
    expect(after.people.sparringWith).toBeNull();
  });
});
