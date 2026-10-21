// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { serialize, type GameState, type SaveStore } from '@/game';
import { ctx, newGame } from '@/test/gameFixtures';

import { App } from '../App';

/** The Jutsu deck: plain chips for a few cards, the finder's fields and pages for many. */

function storeWith(game: GameState): SaveStore {
  const save = serialize(game);
  return { load: () => save, save: () => undefined, clear: () => undefined };
}

/** A character who knows every technique open to anyone. */
function knowingEverything(): GameState {
  const game = newGame();
  const known = ctx.content.techniques.all.filter((t) => !t.clan).map((t) => t.id);
  return { ...game, techniques: { ...game.techniques, known } };
}

async function openDeck(game: GameState) {
  const user = userEvent.setup();
  render(<App store={storeWith(game)} />);
  await user.click(screen.getByRole('button', { name: /Continue/ }));
  await user.click(screen.getByRole('button', { name: 'Jutsu' }));
  return user;
}

describe('the Jutsu deck', () => {
  it('keeps to the art chips while the deck is small', async () => {
    await openDeck(newGame());
    expect(screen.queryByLabelText('Search techniques')).toBeNull();
    expect(screen.queryByRole('navigation', { name: 'Pages' })).toBeNull();
  });

  it('finds techniques in a big deck by kind and art, a page at a time', async () => {
    const user = await openDeck(knowingEverything());
    const deckCards = () => document.querySelectorAll('.deck .deck-slot').length;
    const pages = screen.getByRole('navigation', { name: 'Pages' });
    const before = document.querySelector('.deck .deck-slot')?.textContent;
    await user.click(within(pages).getByRole('button', { name: 'Next' }));
    expect(document.querySelector('.deck .deck-slot')?.textContent).not.toBe(before);

    await user.selectOptions(screen.getByLabelText('Kind'), 'clone');
    const clones = deckCards();
    expect(clones).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Taijutsu' }));
    expect(deckCards()).toBeLessThanOrEqual(clones);
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByLabelText('Kind')).toHaveValue('all');
  });
});
