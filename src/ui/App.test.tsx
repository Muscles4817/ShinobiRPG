// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { SaveStore } from '@/game';

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

type User = ReturnType<typeof userEvent.setup>;

async function startGame(user: User, world = /Land of Embers/) {
  await user.click(screen.getByRole('button', { name: world }));
  await user.click(screen.getByRole('button', { name: 'Turn the page' }));
  await user.click(screen.getAllByRole('button', { name: /%/ })[0]!);
  await user.click(screen.getByRole('button', { name: 'Find your file' }));
  await user.type(screen.getByLabelText('Given name'), 'Aoi');
  for (let page = 0; page < 6; page++) {
    await user.click(screen.getByRole('button', { name: 'Turn the page' }));
  }
  await user.click(screen.getByRole('button', { name: /forehead protector/i }));
}

function place(name: RegExp) {
  return screen.getByRole('button', { name });
}

describe('App (smoke test)', () => {
  it('starts in the chosen world’s village and autosaves', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    render(<App store={store} />);
    await startGame(user);
    expect(screen.getByRole('heading', { name: 'Tōrōgakure' })).toBeInTheDocument();
    expect(store.data).toContain('"packId":"original"');
  });

  it('starts in Konohagakure with the fan pack', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user, /Hidden Leaf/);
    expect(screen.getByRole('heading', { name: 'Konohagakure' })).toBeInTheDocument();
    expect(place(/Ichiraku is open|Shopping District/)).toBeInTheDocument();
  });

  it('trains at the training grounds', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(place(/Training Grounds/));
    const drill = () =>
      screen.getAllByRole('article').find((a) => a.textContent.includes('Rooftop Sprints'))!;
    await user.click(within(drill()).getByRole('button', { name: 'Train' }));
    expect(within(drill()).getByRole('button', { name: /Again/ })).toBeInTheDocument();
  });

  it('plays a mission from the notice board to its debrief', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(place(/Mission Hall/));
    await user.click(screen.getByRole('button', { name: /Lantern-Keeper/ }));
    await user.click(screen.getByRole('button', { name: 'Accept the job' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: /Chase her down/ }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/^\+\d+ ryo$/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows travel destinations as coming soon', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(screen.getByRole('button', { name: /Travel/ }));
    expect(screen.getByText('You are here')).toBeInTheDocument();
    expect(screen.getAllByText('Coming soon').length).toBeGreaterThan(0);
  });

  it('opens every dock tab and place without crashing', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    for (const name of [/Market Street/, /Academy/, /^Home/, /Hospital/]) {
      await user.click(screen.getByRole('button', { name: /Here/ }));
      await user.click(place(name));
    }
    for (const tab of [/Jutsu/, /Shinobi/, /Record/]) {
      await user.click(screen.getByRole('button', { name: tab }));
    }
    expect(screen.getByRole('heading', { name: 'Record' })).toBeInTheDocument();
  });

  it('resumes a saved game', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    const first = render(<App store={store} />);
    await startGame(user);
    first.unmount();
    render(<App store={store} />);
    expect(screen.getByRole('heading', { name: 'Tōrōgakure' })).toBeInTheDocument();
  });

  it('creates a clan character with point-buy grades', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    render(<App store={store} />);
    await user.click(screen.getByRole('button', { name: /Hidden Leaf/ }));
    await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    await user.click(screen.getAllByRole('button', { name: /%/ })[0]!);
    await user.click(screen.getByRole('button', { name: 'Find your file' }));
    await user.type(screen.getByLabelText('Given name'), 'Itachi');
    await user.click(screen.getByRole('button', { name: /^Uchiha/ }));
    await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    await user.click(screen.getByRole('button', { name: 'Point buy' }));
    const kenjutsu = screen.getByRole('group', { name: 'Kenjutsu' });
    await user.click(within(kenjutsu).getByRole('button', { name: 'A' }));
    expect(screen.getByText(/Points spent 6 of 3/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Turn the page' })).toBeDisabled();
    await user.click(within(kenjutsu).getByRole('button', { name: 'C' }));
    for (let page = 0; page < 5; page++) {
      await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    }
    await user.click(screen.getByRole('button', { name: /forehead protector/i }));
    expect(store.data).toContain('"clanId":"uchiha"');
    await user.click(screen.getByRole('button', { name: /Shinobi/ }));
    expect(screen.getByRole('heading', { name: 'Itachi Uchiha' })).toBeInTheDocument();
    expect(screen.getByText(/Sharingan/)).toBeInTheDocument();
  });

  it('reports an unreadable save instead of crashing', () => {
    render(<App store={memoryStore('garbage')} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be loaded/);
  });
});
