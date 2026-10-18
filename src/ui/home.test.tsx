// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { type GameAction, type GameState } from '@/game';
import { act, ctx, newGame } from '@/test/gameFixtures';

import { HomeMaking } from './screens/places/HomeMaking';
import { LettingsPage } from './screens/places/LettingsPage';

/** The lettings office and the home's own sections. */
describe('making a home (smoke test)', () => {
  const ready = (): GameState => {
    const game = newGame({ wallet: { ryo: 8000 } });
    return { ...game, standing: { ...game.standing, rank: 'chunin', missionsCompleted: 5 } };
  };

  it('lets a home and sells furniture at the lettings office', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    render(
      <LettingsPage
        ctx={ctx}
        state={ready()}
        perform={(a) => done.push(a)}
        onBack={() => undefined}
      />,
    );
    expect(screen.getByText('The river houses are still being built.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Buy, 4000 ryo' }));
    await user.click(screen.getAllByRole('button', { name: 'Buy and take it home' })[0]!);
    expect(done).toEqual([
      { type: 'moveHome', homeId: 'dyers-townhouse', buy: true },
      { type: 'buyFurnishing', furnishingId: 'cotton-futon' },
    ]);
  });

  it('shows the furniture, garden, yard, guest room and shelf of a townhouse', () => {
    const home = act(ready(), { type: 'moveHome', homeId: 'dyers-townhouse', buy: true });
    render(
      <HomeMaking ctx={ctx} state={home} perform={() => undefined} onBack={() => undefined} />,
    );
    for (const heading of [
      'Furnishing',
      'The garden',
      'The yard',
      'The guest room',
      'The keepsake shelf',
    ]) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    }
    expect(screen.getAllByText('Empty bed')).toHaveLength(6);
  });
});
