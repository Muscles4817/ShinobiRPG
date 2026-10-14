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
  for (let page = 0; page < 9; page++) {
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

/** Skips to the end of what the watch screen is playing, if it is playing anything. */
async function skipWatching(user: ReturnType<typeof userEvent.setup>) {
  const skip = screen.queryByRole('button', { name: 'Skip' });
  if (skip) await user.click(skip);
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
    // The standing patrol is always up; other postings depend on the day's board.
    await user.click(screen.getByRole('button', { name: /Lantern Patrol/ }));
    await user.click(screen.getByRole('button', { name: 'Accept the job' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: /Relight them/ }));
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

  it('stamps technique ranks, and folds away scrolls you can’t study yet', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(place(/Academy/));
    const comingUp = screen.getByRole('heading', { name: 'Coming up' }).parentElement!;
    expect(
      within(comingUp).getAllByText(/^Needs [A-S] [\w ū]+; you're [A-S]\.$/).length,
    ).toBeGreaterThan(0);
    await user.click(screen.getAllByText('What it does')[0]!);
    expect(screen.getAllByText('Reach').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/of an equal’s health$/).length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: /Jutsu/ }));
    expect(screen.getAllByLabelText('Rank E').length).toBeGreaterThan(0);
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

  it('trains with your sensei among the people at the training grounds', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(place(/Training Grounds/));
    const here = screen.getByRole('region', { name: 'People here' });
    const sensei = within(here).getAllByRole('article')[0]!;
    expect(within(sensei).getByText(/^Your sensei\./)).toBeInTheDocument();
    const train = within(sensei)
      .getAllByRole('button', { name: /^Train / })
      .find((b) => !(b as HTMLButtonElement).disabled)!;
    await user.click(train);
    expect(within(screen.getByRole('dialog')).getByText(/^Lesson with/)).toBeInTheDocument();
  });

  it('offers sparring at the training grounds', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(place(/Training Grounds/));
    const sparring = screen.getByRole('region', { name: 'Sparring' });
    const spar = within(sparring)
      .getAllByRole('button', { name: 'Spar' })
      .find((b) => !(b as HTMLButtonElement).disabled)!;
    await user.click(spar);
    expect(screen.getByText('Sparring')).toBeInTheDocument();
    // The default style plays out on your cards: begin each round, skip through watching it
    // (as an impatient player would), go back to plan, and on to the end.
    // The last exchange plays on the stage before the result card, behind a Continue.
    let finale = false;
    for (let i = 0; i < 120 && !screen.queryByRole('dialog'); i++) {
      const leave = screen.queryByRole('button', { name: 'Continue' });
      finale ||= leave !== null;
      const next =
        leave ??
        screen.queryByRole('button', { name: 'Skip' }) ??
        screen.queryByRole('button', { name: /^Begin (the fight|round)/ }) ??
        screen.queryByRole('button', { name: 'Plan the next round' }) ??
        screen.getByRole('button', { name: /^Watch the round/ });
      await user.click(next);
    }
    expect(finale).toBe(true);
    expect(within(screen.getByRole('dialog')).getByText(/^Spar with/)).toBeInTheDocument();
  });

  it('has no fight-style switch while only one style is offered', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(screen.getByRole('button', { name: 'Shinobi' }));
    expect(screen.queryByText(/Fight style/)).not.toBeInTheDocument();
  });

  it('plans a fight with cards for each distance, then watches the round', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
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
    await skipWatching(user);
    await user.click(screen.getByRole('button', { name: /^Watch the round/ }));
    await skipWatching(user);
    expect(screen.queryByText(/The round is over/) ?? screen.queryByRole('dialog')).not.toBeNull();
  });

  it('orders the plan and sets when and at whom each card plays', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(place(/Training Grounds/));
    const sparring = screen.getByRole('region', { name: 'Sparring' });
    await user.click(
      within(sparring)
        .getAllByRole('button', { name: 'Spar' })
        .find((b) => !(b as HTMLButtonElement).disabled)!,
    );
    // The cards open at the distance you are fighting at; this test works on Close.
    await user.click(screen.getByRole('tab', { name: /^Close/ }));
    const order = () => within(screen.getByRole('list', { name: /^Close: first to last/ }));
    const second = order().getAllByRole('listitem')[1]!;
    const name = within(second).getAllByRole('button')[0]!.querySelector('b')!.textContent;
    await user.click(within(second).getByRole('button', { name: /^Move up/ }));
    const first = order().getAllByRole('listitem')[0]!;
    expect(first.textContent).toContain(name);
    // How a card plays reads as a sentence; tapping it opens the pickers.
    await user.click(first.querySelector('.plan-when summary')!);
    const when = within(first).getByRole('combobox', { name: /^When for/ });
    await user.selectOptions(when, 'A foe is hidden');
    const now = order().getAllByRole('listitem')[0]!;
    expect(within(now).getByRole('combobox', { name: /^When for/ })).toHaveDisplayValue(
      'A foe is hidden',
    );
    await user.click(screen.getByRole('button', { name: /^Begin the fight/ }));
    await skipWatching(user);
    expect(screen.getByRole('button', { name: /^Watch the round/ })).toBeInTheDocument();
  });

  it('buys gear at the forge, groceries at the market, and cooks at home', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(place(/Kurogane Forge/));
    const knuckles = screen
      .getAllByRole('article')
      .find((a) => a.textContent.includes('Wrapped Knuckles'))!;
    expect(within(knuckles).getByLabelText('Rank D')).toBeInTheDocument();
    expect(within(knuckles).getByText(/through a guard/)).toBeInTheDocument();
    const katana = screen
      .getAllByRole('article')
      .find((a) => a.textContent.includes('Kurogane Katana'))!;
    expect(within(katana).getByText(/sold to chūnin/)).toBeInTheDocument();
    expect(within(katana).getByRole('button', { name: 'Buy' })).toBeDisabled();
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

  it('lets you start dead last, and your file and sheet say so', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    render(<App store={store} />);
    await user.click(screen.getByRole('button', { name: /Land of Embers/ }));
    await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    await user.click(screen.getAllByRole('button', { name: /%/ })[0]!);
    await user.click(screen.getByRole('button', { name: 'Find your file' }));
    await user.type(screen.getByLabelText('Given name'), 'Aoi');
    await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    await user.click(screen.getByRole('button', { name: /^Dead last/ }));
    await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    expect(screen.getByRole('button', { name: /^Civilian family/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Main house/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    await user.click(screen.getByRole('button', { name: /^Slight/ }));
    await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    expect(screen.getByText(/0 gifts to give/)).toBeInTheDocument();
    for (let page = 0; page < 5; page++) {
      await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    }
    expect(screen.getByText('Dead last')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /forehead protector/i }));
    expect(store.data).toContain('"classStanding":"dead-last"');
    await formTeam(user);
    await user.click(screen.getByRole('button', { name: 'Shinobi' }));
    expect(screen.getByText('Dead last')).toBeInTheDocument();
  });

  it('creates a clan character, raised by the clan, with a file written by hand', async () => {
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
    await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    await user.click(screen.getByRole('button', { name: /^Main house/ }));
    await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    await user.click(screen.getByRole('button', { name: /^Heavy/ }));
    await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    await user.click(screen.getByRole('button', { name: 'By hand' }));
    await user.click(screen.getByRole('button', { name: 'Less training in Speed' }));
    await user.click(screen.getByRole('button', { name: 'More training in Kenjutsu' }));
    const kenjutsu = screen.getByRole('group', { name: 'Kenjutsu' });
    // A second gift is more than the middle of the class has room for…
    await user.click(within(kenjutsu).getByRole('button', { name: 'Kenjutsu: no gift' }));
    expect(screen.getAllByText(/Those gifts take 2/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Turn the page' })).toBeDisabled();
    // …so it becomes a flaw instead, which gives points back.
    await user.click(within(kenjutsu).getByRole('button', { name: 'Kenjutsu: Gifted' }));
    expect(within(kenjutsu).getByRole('button', { name: 'Kenjutsu: Flawed' })).toBeInTheDocument();
    for (let page = 0; page < 5; page++) {
      await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    }
    await user.click(screen.getByRole('button', { name: /forehead protector/i }));
    expect(store.data).toContain('"clanId":"uchiha"');
    expect(store.data).toContain('"upbringingId":"clan-main"');
    expect(store.data).toContain('"buildId":"heavy"');
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
