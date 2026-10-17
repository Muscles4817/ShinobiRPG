// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { villageView, type GameAction, type GameState } from '@/game';
import { ctx, newGame } from '@/test/gameFixtures';

import { BondsScreen } from './screens/BondsScreen';
import { VillageLife } from './screens/VillageLife';

/** A game whose seed meets a stray on its first day. */
function withStray(): GameState {
  for (let seed = 1; seed < 200; seed++) {
    const game = newGame();
    const seeded = { ...game, board: { ...game.board, seed } };
    if (villageView(seeded, ctx).stray) return seeded;
  }
  throw new Error('no seed meets a stray');
}

/** A stray in the village, and the companion it becomes (smoke test). */
describe('companions (smoke test)', () => {
  it('crouches by a stray in the village', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    render(<VillageLife view={villageView(withStray(), ctx)} perform={(a) => done.push(a)} />);
    await user.click(screen.getByRole('button', { name: 'Crouch and wait' }));
    expect(done).toEqual([{ type: 'befriendStray' }]);
  });

  it('shows your companion first on the Bonds tab', () => {
    const game = newGame();
    const hound = {
      id: 'stray-hound-1',
      kindId: 'stray-hound',
      name: 'Ash',
      stats: game.character.stats,
      aptitude: game.character.aptitude,
      bond: 5,
      lastGrownDay: 0,
    };
    const state = { ...game, companions: { owned: { player: hound }, befriending: null } };
    const opened: string[] = [];
    render(
      <BondsScreen
        ctx={ctx}
        state={state}
        perform={() => undefined}
        onOpenPerson={(id) => opened.push(id)}
      />,
    );
    expect(screen.getByRole('heading', { name: 'At your side' })).toBeTruthy();
    expect(screen.getByText(/Ash fights its own way until you are acquaintances/)).toBeTruthy();
  });
});
