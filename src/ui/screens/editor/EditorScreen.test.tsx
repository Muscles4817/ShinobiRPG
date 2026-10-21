// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { SaveStore } from '@/game';

import { App } from '../../App';

/** The editor: change a fighter, see it kept on the device, and put them back. */

function memoryStore(): SaveStore & { data: string | null } {
  const store: SaveStore & { data: string | null } = {
    data: null,
    load: () => store.data,
    save: (d: string) => {
      store.data = d;
    },
    clear: () => {
      store.data = null;
    },
  };
  return store;
}

describe('the editor', () => {
  it('changes a fighter’s stats and techniques, keeps them, and resets them', async () => {
    const user = userEvent.setup();
    const edits = memoryStore();
    render(<App store={memoryStore()} edits={edits} />);
    await user.click(screen.getByRole('button', { name: /^Editor/ }));
    await user.click(screen.getByLabelText('Search by name'));
    await user.paste('Kakashi Hatake');
    await user.click(screen.getByRole('button', { name: /^Kakashi Hatake,/ }));
    const sheet = screen.getByRole('article', { name: 'Editing Kakashi Hatake' });
    expect(within(sheet).getByText('As the world writes them.')).toBeInTheDocument();

    const speed = within(sheet).getByLabelText(/^Speed/);
    const was = Number(speed.getAttribute('value'));
    await user.click(within(sheet).getByRole('button', { name: 'Raise Speed' }));
    expect(within(sheet).getByText(`Written as ${was}`)).toBeInTheDocument();
    expect(edits.data).toContain('"person:kakashi"');

    await user.click(within(sheet).getAllByRole('button', { name: /^Add / })[0]!);
    expect(edits.data).toContain('techniqueIds');

    await user.click(within(sheet).getByRole('button', { name: 'Back to the list' }));
    expect(screen.getByRole('button', { name: /^Kakashi Hatake,.*edited$/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Kakashi Hatake,/ }));
    await user.click(screen.getByRole('button', { name: 'Reset to the original' }));
    await user.click(screen.getByRole('button', { name: 'Reset Kakashi Hatake' }));
    expect(screen.getByText('As the world writes them.')).toBeInTheDocument();
    expect(edits.data).not.toContain('kakashi');
  });

  async function openKakashi() {
    const user = userEvent.setup();
    render(<App store={memoryStore()} edits={memoryStore()} />);
    await user.click(screen.getByRole('button', { name: /^Editor/ }));
    await user.click(screen.getByLabelText('Search by name'));
    await user.paste('Kakashi Hatake');
    await user.click(screen.getByRole('button', { name: /^Kakashi Hatake,/ }));
    return { user, sheet: screen.getByRole('article', { name: 'Editing Kakashi Hatake' }) };
  }

  it('finds techniques to add by kind, element and rank, a page at a time', async () => {
    const { user, sheet } = await openKakashi();
    const adds = () => within(sheet).getAllByRole('button', { name: /^Add / });
    const pages = within(sheet).getByRole('navigation', { name: 'Pages' });
    const firstPage = adds()[0]!.getAttribute('aria-label');
    await user.click(within(pages).getByRole('button', { name: 'Next' }));
    expect(adds()[0]!.getAttribute('aria-label')).not.toBe(firstPage);

    await user.selectOptions(within(sheet).getByLabelText('Kind'), 'power-up');
    expect(
      within(sheet).getByRole('button', { name: /^Add Eight Gates: Gate of Opening/ }),
    ).toBeVisible();
    await user.selectOptions(within(sheet).getByLabelText('Element'), 'none');
    await user.selectOptions(within(sheet).getByLabelText('Rank'), 'C');
    expect(adds().map((b) => b.getAttribute('aria-label'))).toContain(
      'Add Eight Gates: Gate of Opening',
    );
    await user.click(within(sheet).getByRole('button', { name: 'Clear filters' }));
    expect(within(sheet).getByLabelText('Kind')).toHaveValue('all');
  });

  it('opens on a desk with a fighter on the sheet, beside the list', async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string) => ({
        matches: query.includes('min-width'),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });
    try {
      const user = userEvent.setup();
      render(<App store={memoryStore()} edits={memoryStore()} />);
      await user.click(screen.getByRole('button', { name: /^Editor/ }));
      expect(screen.getByRole('region', { name: 'Fighters' })).toBeInTheDocument();
      expect(screen.getByRole('article', { name: /^Editing / })).toBeInTheDocument();
    } finally {
      Reflect.deleteProperty(window, 'matchMedia');
    }
  });
});
