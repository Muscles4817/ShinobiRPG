// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { serialize, type SaveStore } from '@/game';
import { newGame } from '@/test/gameFixtures';

import { App } from './App';

/** The desktop layout: the rail, the village and the you panel, and the phone layout untouched. */

function storeWith(save: string): SaveStore {
  return { load: () => save, save: () => undefined, clear: () => undefined };
}

/** Makes every `min-width` query match (a wide window), or none (a phone). */
function windowWide(wide: boolean) {
  window.matchMedia = (query: string) =>
    ({
      matches: wide && query.includes('min-width'),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList; // a stand-in: jsdom has no matchMedia of its own
}

async function openGame() {
  const user = userEvent.setup();
  render(<App store={storeWith(serialize(newGame()))} />);
  await user.click(screen.getByRole('button', { name: /Continue/ }));
  return user;
}

describe('the desktop layout (smoke test)', () => {
  // jsdom has no matchMedia: take the stand-in away again so other tests see a plain window.
  afterEach(() => {
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('puts the dock and the places in a rail, and you in a panel of your own', async () => {
    windowWide(true);
    const user = await openGame();
    const you = screen.getByRole('complementary', { name: 'You' });
    expect(within(you).getByText('Health')).toBeInTheDocument();
    // The village screen leaves your vitals to the panel.
    expect(screen.getAllByText('Health')).toHaveLength(1);

    const rail = screen.getByRole('region', { name: /^Places in/ });
    const first = within(rail)
      .getAllByRole('button')
      .find((b) => !b.hasAttribute('disabled'));
    await user.click(first!);
    expect(first).toHaveAttribute('aria-current', 'page');
    // The panel stays beside a place page too.
    expect(screen.getByRole('complementary', { name: 'You' })).toBeInTheDocument();
  });

  it('switches tabs with the number keys', async () => {
    windowWide(true);
    const user = await openGame();
    await user.keyboard('3');
    expect(screen.getByRole('button', { name: 'Jutsu' })).toHaveAttribute('aria-current', 'page');
    await user.keyboard('1');
    expect(screen.getByRole('button', { name: 'Here' })).toHaveAttribute('aria-current', 'page');
  });

  it('keeps the you panel beside every tab', async () => {
    windowWide(true);
    const user = await openGame();
    const dock = screen.getByRole('navigation', { name: 'Main' });
    for (const tab of ['Travel', 'Jutsu', 'Bonds', 'Shinobi', 'Record']) {
      await user.click(within(dock).getByRole('button', { name: tab }));
      expect(within(dock).getByRole('button', { name: tab })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(screen.getByRole('complementary', { name: 'You' })).toBeInTheDocument();
    }
  });

  it('keeps the phone layout as it was on a narrow screen', async () => {
    windowWide(false);
    const user = await openGame();
    expect(screen.queryByRole('complementary', { name: 'You' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /^Places in/ })).not.toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
    await user.keyboard('3');
    expect(screen.getByRole('button', { name: 'Here' })).toHaveAttribute('aria-current', 'page');
  });
});
