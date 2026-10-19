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
});
