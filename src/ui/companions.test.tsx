// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { villageView, type GameAction, type GameState } from '@/game';
import { ctx, newGame, withHound } from '@/test/gameFixtures';

import { BondsScreen } from './screens/BondsScreen';
import { VillageLife } from './screens/VillageLife';
import { CompanionSheet } from './components/CompanionSheet';
import { VetPage } from './screens/places/VetPage';

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
    const state = withHound(newGame(), { bond: 5 });
    const opened: string[] = [];
    render(
      <BondsScreen
        ctx={ctx}
        state={state}
        perform={() => undefined}
        onOpenPerson={(id) => opened.push(id)}
        onOpenCompanion={() => opened.push('companion')}
      />,
    );
    expect(screen.getByRole('heading', { name: 'At your side' })).toBeTruthy();
    expect(screen.getByText(/Ash fights its own way until you are acquaintances/)).toBeTruthy();
  });

  it('feeds your companion scraps from its sheet', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    const state = withHound(newGame(), { lastFedDay: 0 });
    render(
      <CompanionSheet
        ctx={ctx}
        state={state}
        perform={(a) => done.push(a)}
        onClose={() => undefined}
      />,
    );
    expect(screen.getByRole('img', { name: 'Health 60 of 60' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Scraps/ }));
    expect(done).toEqual([{ type: 'feedCompanion', ingredientId: null }]);
  });

  it('buys medicine at the animal clinic', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    const state = withHound(newGame({ wallet: { ryo: 100 } }));
    render(
      <VetPage ctx={ctx} state={state} perform={(a) => done.push(a)} onBack={() => undefined} />,
    );
    expect(screen.getByText(/Ash is in good health/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Buy a dose' }));
    expect(done).toEqual([{ type: 'buyMedicine' }]);
  });
});
