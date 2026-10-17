// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { villageView, wildsView, type GameAction, type GameState } from '@/game';
import { ctx, newGame, withHound } from '@/test/gameFixtures';

import { BondsScreen } from './screens/BondsScreen';
import { VillageLife } from './screens/VillageLife';
import { CompanionSheet } from './components/CompanionSheet';
import { VetPage } from './screens/places/VetPage';
import { WildsPage } from './screens/places/WildsPage';

/** A game whose seed meets a stray on its first day. */
function withStray(): GameState {
  for (let seed = 1; seed < 200; seed++) {
    const game = newGame();
    const seeded = { ...game, board: { ...game.board, seed } };
    if (villageView(seeded, ctx).stray) return seeded;
  }
  throw new Error('no seed meets a stray');
}

/** A game whose seed has a wolf living in the woods. */
function withWolf(): GameState {
  for (let seed = 1; seed < 200; seed++) {
    const game = newGame();
    const seeded = { ...game, board: { ...game.board, seed } };
    if (wildsView(seeded, ctx, 'lantern-woods')?.wild) return seeded;
  }
  throw new Error('no seed has a wolf in the woods');
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

  it('takes a pup home from the clinic’s litter', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    const state = newGame({ wallet: { ryo: 1000 } });
    render(
      <VetPage ctx={ctx} state={state} perform={(a) => done.push(a)} onBack={() => undefined} />,
    );
    expect(screen.getByRole('heading', { name: 'The litter' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Take a pup home' }));
    expect(done).toEqual([{ type: 'takePup' }]);
  });

  it('follows a wild one’s trail in the woods', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    const state = withWolf();
    render(
      <WildsPage
        ctx={ctx}
        state={state}
        perform={(a) => done.push(a)}
        onBack={() => undefined}
        placeId="lantern-woods"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Signs of a forest wolf' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Follow the trail' }));
    expect(done).toEqual([{ type: 'trackWild', placeId: 'lantern-woods' }]);
  });

  it('takes home an animal waiting at the clinic, and asks twice before rehoming', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    const owner = withHound(newGame());
    const pup = { ...owner.companions.owned.player!, id: 'stray-hound-9', name: 'Mochi' };
    const state = { ...owner, companions: { ...owner.companions, waiting: pup } };
    render(
      <VetPage ctx={ctx} state={state} perform={(a) => done.push(a)} onBack={() => undefined} />,
    );
    expect(screen.getByRole('heading', { name: 'Mochi is waiting' })).toBeTruthy();
    expect(screen.getByText(/Rehome Ash first/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Ask the vet to rehome Ash' }));
    await user.click(screen.getByRole('button', { name: 'Yes, let Ash go' }));
    expect(done).toEqual([{ type: 'rehomeCompanion' }]);
  });

  it('says how it is growing: its body with time, its skills with training', () => {
    render(
      <CompanionSheet
        ctx={ctx}
        state={withHound(newGame())}
        perform={() => undefined}
        onClose={() => undefined}
      />,
    );
    expect(screen.getByText(/built for the nose/)).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Body' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Learned' })).toBeTruthy();
  });
});
