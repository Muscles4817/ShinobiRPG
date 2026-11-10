// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { serialize, type GameState, type SaveStore } from '@/game';
import { NO_WORKSHOP, withPuppet } from '@/systems/puppets';
import { newGame } from '@/test/gameFixtures';

import { App } from '../App';

/** The puppet card on the Shinobi tab: each puppet's condition, and mending one at home. */

function storeWith(game: GameState): SaveStore {
  const save = serialize(game);
  return { load: () => save, save: () => undefined, clear: () => undefined };
}

function withBrokenDoll(): GameState {
  const game = newGame();
  const owned = withPuppet(NO_WORKSHOP, 'lantern-doll', 'Lantern Doll');
  const puppets = owned.puppets.map((p) => ({ ...p, condition: 0 }));
  const known = [...game.techniques.known, 'unseal-lantern-doll'];
  return {
    ...game,
    techniques: { ...game.techniques, known },
    puppetry: { ...owned, puppets },
    wallet: { ryo: 500 },
  };
}

describe('the puppet card', () => {
  it('shows a broken puppet staying home, and mends it at the bench', async () => {
    const user = userEvent.setup();
    render(<App store={storeWith(withBrokenDoll())} />);
    await user.click(screen.getByRole('button', { name: /Continue/ }));
    await user.click(screen.getByRole('button', { name: 'Shinobi' }));
    const card = screen.getByRole('region', { name: 'Your puppets' });
    expect(within(card).getByText('Broken')).toBeTruthy();
    expect(within(card).getByText(/stays home/)).toBeTruthy();
    await user.click(within(card).getByRole('button', { name: /Mend at the bench/ }));
    expect(
      within(screen.getByRole('region', { name: 'Your puppets' })).getByText('Badly damaged'),
    ).toBeTruthy();
  });

  it('sets a new puppet on the bench from the materials you keep', async () => {
    const user = userEvent.setup();
    const game = withBrokenDoll();
    const puppetry = { ...game.puppetry, stock: { 'pine-and-wire': 2 } };
    render(<App store={storeWith({ ...game, puppetry })} />);
    await user.click(screen.getByRole('button', { name: /Continue/ }));
    await user.click(screen.getByRole('button', { name: 'Shinobi' }));
    const card = screen.getByRole('region', { name: 'Your puppets' });
    await user.click(within(card).getByRole('checkbox', { name: /Wrist blades/ }));
    await user.type(within(card).getByRole('textbox', { name: 'Name' }), 'Kite');
    await user.click(within(card).getByRole('button', { name: 'Set it on the bench' }));
    const after = screen.getByRole('region', { name: 'Your puppets' });
    expect(within(after).getByText('On the bench: Kite')).toBeTruthy();
  });
});
