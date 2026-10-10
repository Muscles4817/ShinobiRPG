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
  await formTeam(user);
}

async function formTeam(user: User) {
  await user.click(screen.getByRole('button', { name: 'Hear the teams' }));
  await user.click(screen.getAllByRole('button', { name: /^Train under/ })[0]!);
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Continue' }));
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

  it('shows village talk and the next festival on the village screen', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    const life = screen.getByRole('region', { name: 'Village life' });
    expect(within(life).getByText('Village talk')).toBeInTheDocument();
    expect(within(life).getByText('Kite Day')).toBeInTheDocument();
  });

  it('the izakaya opens at night: regulars, a round and supper', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    const first = render(<App store={store} />);
    await startGame(user);
    first.unmount();
    const save = JSON.parse(store.data ?? '{}') as { state: { time: unknown } };
    save.state.time = { day: 2, slot: 3 };
    render(<App store={memoryStore(JSON.stringify(save))} />);
    await user.click(place(/The Paper Lantern/));
    expect(screen.getByText('Tonight’s crowd')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Stand everyone a round/ }));
    expect(screen.getByText('You’ve already stood a round tonight.')).toBeInTheDocument();
    expect(screen.getByText('Overheard at the counter')).toBeInTheDocument();
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
    for (const tab of [/Jutsu/, /Bonds/, /Shinobi/, /Record/]) {
      await user.click(screen.getByRole('button', { name: tab }));
    }
    expect(screen.getByRole('heading', { name: 'Record' })).toBeInTheDocument();
  });

  it('forms a team, then talks to someone who is here', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(screen.getByRole('button', { name: /Bonds/ }));
    expect(screen.getByRole('heading', { name: 'Your team' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Here/ }));
    const around = screen.getByRole('region', { name: 'Who’s here' });
    await user.click(within(around).getByRole('button', { name: /Kaen/ }));
    await user.click(screen.getByRole('button', { name: 'Talk to Kaen' }));
    await user.click(screen.getByRole('button', { name: /Bet I can beat you anyway/ }));
    expect(screen.getByText(/^\+\d+ bond$/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Say goodbye' }));
    expect(screen.getByRole('heading', { name: 'Tōrōgakure' })).toBeInTheDocument();
  });

  it('offers a sensei lesson and sparring at the training grounds', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(place(/Training Grounds/));
    expect(screen.getByText(/Weekly lesson/)).toBeInTheDocument();
    const sparring = screen.getByRole('region', { name: 'Sparring' });
    const spar = within(sparring)
      .getAllByRole('button', { name: 'Spar' })
      .find((b) => !(b as HTMLButtonElement).disabled)!;
    await user.click(spar);
    expect(screen.getByText('Sparring')).toBeInTheDocument();
    for (let i = 0; i < 60 && !screen.queryByRole('dialog'); i++) {
      await user.click(screen.getByRole('button', { name: /^Strike/ }));
    }
    expect(within(screen.getByRole('dialog')).getByText(/^Spar with/)).toBeInTheDocument();
  });

  it.each([
    ['Plan & Watch', /cards for each distance/],
    ['Deck', 'End turn'],
    ['Mind Game', 'Feint'],
  ])('switches the fight style to %s and fights with it', async (style, marker) => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(screen.getByRole('button', { name: 'Shinobi' }));
    await user.click(screen.getByRole('button', { name: new RegExp(`^${style}`) }));
    await user.click(screen.getByRole('button', { name: /Here/ }));
    await user.click(place(/Training Grounds/));
    const sparring = screen.getByRole('region', { name: 'Sparring' });
    const spar = within(sparring)
      .getAllByRole('button', { name: 'Spar' })
      .find((b) => !(b as HTMLButtonElement).disabled)!;
    await user.click(spar);
    expect(screen.getAllByText(marker).length).toBeGreaterThan(0);
  });

  it('plans a fight with cards for each distance, then watches the round', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(screen.getByRole('button', { name: 'Shinobi' }));
    await user.click(screen.getByRole('button', { name: /^Plan & Watch/ }));
    await user.click(screen.getByRole('button', { name: /Here/ }));
    await user.click(place(/Training Grounds/));
    const sparring = screen.getByRole('region', { name: 'Sparring' });
    await user.click(
      within(sparring)
        .getAllByRole('button', { name: 'Spar' })
        .find((b) => !(b as HTMLButtonElement).disabled)!,
    );
    await user.click(screen.getByRole('tab', { name: /^Far/ }));
    const dodge = screen.getByRole('button', { name: /^Dodge/ });
    const before = dodge.getAttribute('aria-pressed');
    if (before === 'true' || !(dodge as HTMLButtonElement).disabled) {
      await user.click(dodge);
      expect(screen.getByRole('button', { name: /^Dodge/ }).getAttribute('aria-pressed')).not.toBe(
        before,
      );
    }
    await user.click(screen.getByRole('button', { name: /^Begin the fight/ }));
    await user.click(screen.getByRole('button', { name: /^Watch the round/ }));
    expect(screen.queryByText(/End of round 1/) ?? screen.queryByRole('dialog')).not.toBeNull();
  });

  it('buys gear at the forge, groceries at the market, and cooks at home', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(place(/Kurogane Forge/));
    const knuckles = screen
      .getAllByRole('article')
      .find((a) => a.textContent.includes('Wrapped Knuckles'))!;
    await user.click(within(knuckles).getByRole('button', { name: 'Buy' }));
    expect(within(knuckles).getByRole('button', { name: 'Wearing' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Here/ }));
    await user.click(place(/Market Street/));
    await user.click(screen.getByRole('button', { name: /^8\s*Rice\s*For cooking/ }));
    await user.click(screen.getByRole('button', { name: /^8\s*Rice\s*1 at home/ }));
    await user.click(screen.getByRole('button', { name: /Here/ }));
    await user.click(place(/^Home/));
    const bento = screen
      .getAllByRole('article')
      .find((a) => a.textContent.includes('Rice Ball Bento'))!;
    await user.click(within(bento).getByRole('button', { name: 'Cook' }));
    expect(screen.getByText(/Today you ate/)).toBeInTheDocument();
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
    await formTeam(user);
    await user.click(screen.getByRole('button', { name: 'Shinobi' }));
    expect(screen.getByRole('heading', { name: 'Itachi Uchiha' })).toBeInTheDocument();
    expect(screen.getByText(/Sharingan/)).toBeInTheDocument();
  });

  it('reports an unreadable save instead of crashing', () => {
    render(<App store={memoryStore('garbage')} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be loaded/);
  });
});
