// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SAVE_VERSION, serialize, type SaveStore } from '@/game';
import { freshGame } from '@/test/gameFixtures';

import { App } from './App';
import { CrashBoundary } from './components/CrashScreen';
import { keepCopy } from './saveKeeping';

/** A save is never lost quietly: unreadable, outdated and replaced saves are kept as a copy. */

function memoryStore(initial: string | null = null): SaveStore & { data: string | null } {
  const store = {
    data: initial,
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

/** A real save, relabelled as written by the version before: loading it runs a migration. */
function olderSave(): string {
  const file = JSON.parse(serialize(freshGame())) as { version: number };
  return JSON.stringify({ ...file, version: SAVE_VERSION - 1 });
}

function Thrower(): never {
  throw new Error('a view met a save it didn’t expect');
}

describe('keeping saves', () => {
  it('keeps a copy of a save a migration chokes on, and says where it is', () => {
    const broken = JSON.stringify({ version: 40, state: {} });
    const store = memoryStore(broken);
    const rescue = memoryStore();
    render(<App store={store} rescue={rescue} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be loaded/);
    expect(screen.getByRole('alert')).toHaveTextContent(/copy of it is kept/);
    expect(rescue.data).toBe(broken);
    expect(store.data).toBe(broken);
  });

  it('keeps a save as an older version wrote it before bringing it up to date', () => {
    const old = olderSave();
    const rescue = memoryStore();
    render(<App store={memoryStore(old)} rescue={rescue} />);
    expect(screen.getByRole('button', { name: /Continue/ })).toBeInTheDocument();
    expect(rescue.data).toBe(old);
  });

  it('keeps no copy of a save that loads as it is', () => {
    const rescue = memoryStore();
    render(<App store={memoryStore(serialize(freshGame()))} rescue={rescue} />);
    expect(rescue.data).toBeNull();
  });

  it('never lets text that isn’t a save take the place of a kept copy', () => {
    const rescue = memoryStore('a good copy');
    keepCopy(rescue, 'half a fi');
    expect(rescue.data).toBe('a good copy');
    const empty = memoryStore();
    keepCopy(empty, 'half a fi');
    expect(empty.data).toBe('half a fi');
  });

  it('loads a pasted save from the title’s settings, keeping the game it replaces', async () => {
    const user = userEvent.setup();
    const mine = serialize(freshGame());
    const theirs = serialize({ ...freshGame(), wallet: { ryo: 7777 } });
    const store = memoryStore(mine);
    const rescue = memoryStore();
    render(<App store={store} rescue={rescue} />);
    await user.click(screen.getByRole('button', { name: /Settings/ }));
    await user.click(screen.getByLabelText('Paste a save here to play it'));
    await user.paste(theirs);
    await user.click(screen.getByRole('button', { name: 'Load this save' }));
    expect(screen.getByText(/^Loaded\./)).toBeInTheDocument();
    expect(store.data).toBe(theirs);
    expect(rescue.data).toBe(mine);
    // The game it replaced can be brought back.
    await user.click(screen.getByRole('button', { name: 'Bring it back' }));
    expect(store.data).toBe(mine);
    expect(rescue.data).toBe(theirs);
  });

  it('refuses pasted text that isn’t a save and leaves the game alone', async () => {
    const user = userEvent.setup();
    const mine = serialize(freshGame());
    const store = memoryStore(mine);
    render(<App store={store} rescue={memoryStore()} />);
    await user.click(screen.getByRole('button', { name: /Settings/ }));
    await user.click(screen.getByLabelText('Paste a save here to play it'));
    await user.paste('not a save');
    await user.click(screen.getByRole('button', { name: 'Load this save' }));
    expect(screen.getByText(/can’t be loaded/)).toBeInTheDocument();
    expect(store.data).toBe(mine);
  });

  it('copies the save out', async () => {
    const user = userEvent.setup();
    const mine = serialize(freshGame());
    render(<App store={memoryStore(mine)} rescue={memoryStore()} />);
    await user.click(screen.getByRole('button', { name: /Settings/ }));
    await user.click(screen.getByRole('button', { name: 'Copy my save' }));
    expect(await screen.findByText(/^Copied\./)).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe(mine);
  });
});

describe('the crash screen', () => {
  it('shows what went wrong and keeps the save in reach when a screen throws', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <CrashBoundary store={memoryStore('my save')}>
        <Thrower />
      </CrashBoundary>,
    );
    expect(screen.getByRole('heading', { name: 'The game stopped' })).toBeInTheDocument();
    expect(screen.getByText('a view met a save it didn’t expect')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy my save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start the game again' })).toBeInTheDocument();
    quiet.mockRestore();
  });
});
