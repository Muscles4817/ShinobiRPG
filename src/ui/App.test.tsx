// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createDefaultContext, type SaveStore } from '@/game';

import { App } from './App';

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

async function startGame(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Your name'), 'Aoi');
  await user.click(screen.getByRole('button', { name: /forehead protector/i }));
}

describe('App (smoke test)', () => {
  it('creates a character, trains, and autosaves', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    render(<App ctx={createDefaultContext()} store={store} />);

    await startGame(user);
    expect(screen.getByText('Aoi')).toBeInTheDocument();
    expect(store.data).toContain('"name":"Aoi"');

    await user.click(screen.getByRole('button', { name: 'Train' }));
    const card = screen.getByRole('heading', { name: 'Rooftop Sprints' }).closest('article')!;
    await user.click(within(card).getByRole('button', { name: 'Train' }));
    expect(screen.getByText(/Rooftop Sprints: Speed \+/)).toBeInTheDocument();
  });

  it('plays a mission to completion', async () => {
    const user = userEvent.setup();
    render(<App ctx={createDefaultContext()} store={memoryStore()} />);
    await startGame(user);

    await user.click(screen.getByRole('button', { name: 'Missions' }));
    const card = screen.getByRole('heading', { name: /Lantern-Keeper/ }).closest('article')!;
    await user.click(within(card).getByRole('button', { name: 'Accept' }));

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: /Chase her down/ }));
    expect(screen.getByText(/Mission complete/)).toBeInTheDocument();
  });

  it('resumes a saved game', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    const first = render(<App ctx={createDefaultContext()} store={store} />);
    await startGame(user);
    first.unmount();

    render(<App ctx={createDefaultContext()} store={store} />);
    expect(screen.getByText('Aoi')).toBeInTheDocument();
  });

  it('reports an unreadable save instead of crashing', () => {
    render(<App ctx={createDefaultContext()} store={memoryStore('garbage')} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be loaded/);
  });
});
