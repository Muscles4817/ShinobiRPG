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
  await user.click(screen.getByRole('button', { name: /^New game/ }));
  await user.click(screen.getByRole('button', { name: world }));
  await user.click(screen.getByRole('button', { name: 'Turn the page' }));
  await user.click(screen.getAllByRole('button', { name: /%/ })[0]!);
  await user.click(screen.getByRole('button', { name: 'Find your file' }));
  await user.type(screen.getByLabelText('Given name'), 'Aoi');
  for (let page = 0; page < 10; page++) {
    await user.click(screen.getByRole('button', { name: 'Turn the page' }));
  }
  await user.click(screen.getByRole('button', { name: /forehead protector/i }));
  await formTeam(user);
}

async function formTeam(user: User) {
  await user.click(screen.getByRole('button', { name: 'Hear the honours' }));
  await user.click(screen.getByRole('button', { name: 'Hear the teams' }));
  await user.click(screen.getAllByRole('button', { name: /^Train under/ })[0]!);
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Continue' }));
  await user.click(screen.getByRole('button', { name: 'Push your chakra into the paper' }));
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Continue' }));
  // The sensei's test: the first choice each round, until they ask how much to show you.
  while (!screen.queryByRole('button', { name: 'Show me everything' })) {
    const choices = within(screen.getByRole('navigation', { name: 'Choices' }));
    await user.click(choices.getAllByRole('button')[0]!);
  }
  await user.click(screen.getByRole('button', { name: 'Show me everything' }));
  // Then your rival comes to find you: answer, and the day begins.
  const replies = screen.queryByRole('navigation', { name: 'Replies' });
  if (replies) await user.click(within(replies).getAllByRole('button')[1]!);
}

function place(name: RegExp) {
  return screen.getByRole('button', { name });
}

/** Skips to the end of what the watch screen is playing, if it is playing anything. */
async function skipWatching(user: ReturnType<typeof userEvent.setup>) {
  const skip = screen.queryByRole('button', { name: 'Skip' });
  if (skip) await user.click(skip);
}

/** Opening every tab and place draws dozens of portraits; jsdom builds SVG slowly. */
const VISIT_EVERYTHING_TIMEOUT = 15_000;

describe('App (smoke test)', () => {
  it('opens on the title: the lanterns, the name and what you can do', () => {
    render(<App store={memoryStore()} />);
    expect(screen.getByRole('heading', { name: 'Shinobi RPG' })).toBeInTheDocument();
    const menu = screen.getByRole('navigation', { name: 'Main menu' });
    expect(within(menu).getByRole('button', { name: /New game/ })).toBeInTheDocument();
    expect(within(menu).getByRole('button', { name: /Versus/ })).toBeInTheDocument();
    const share = within(menu).getByRole('link', { name: /Share on WhatsApp/ });
    expect(share.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/\?text=Shinobi%20RPG/);
    expect(share.getAttribute('href')).toContain(encodeURIComponent('http://localhost'));
  });

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

  it('hands you your sensei’s week on the village screen, planned from tomorrow', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    const slip = screen.getByRole('region', { name: /’s week$/ });
    expect(within(slip).getAllByRole('listitem')).toHaveLength(7);
    expect(within(slip).getByText(/Watching you|Rates you|Unconvinced/)).toBeInTheDocument();
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
    await user.click(screen.getByRole('button', { name: /^Continue/ }));
    await user.click(place(/The Paper Lantern/));
    expect(screen.getByText('Tonight’s crowd')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Stand everyone a round/ }));
    expect(screen.getByText('You’ve already stood a round tonight.')).toBeInTheDocument();
    expect(screen.getByText('Overheard at the counter')).toBeInTheDocument();
    expect(screen.getByText('At the back tables')).toBeInTheDocument();
    const seats = within(screen.getByRole('group', { name: 'Sit with' }));
    await user.click(seats.getByRole('button', { name: /Kaen/ }));
    await user.click(screen.getByRole('button', { name: /Cup for cup/ }));
    expect(screen.getByText('You’ve already spent time with Kaen today.')).toBeInTheDocument();
  });

  it('soaks at the hot springs, alone or beside whoever is in the water', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    const first = render(<App store={store} />);
    await startGame(user);
    first.unmount();
    const save = JSON.parse(store.data ?? '{}') as { state: { time: unknown } };
    save.state.time = { day: 2, slot: 0 };
    render(<App store={memoryStore(JSON.stringify(save))} />);
    await user.click(screen.getByRole('button', { name: /^Continue/ }));
    await user.click(place(/The Ember Springs/));
    expect(screen.getByText('In the water')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Soak beside / }).length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Soak on your own' }));
    expect(screen.getAllByText('You’ve already had your soak today.').length).toBeGreaterThan(0);
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
    // Tap a place on the map: just its card, until you ask for every place again.
    const map = screen.getByRole('region', { name: 'Map' });
    await user.click(within(map).getByRole('button', { name: 'Port Shiomachi' }));
    expect(screen.queryByRole('heading', { name: 'Mount Reikon' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Port Shiomachi' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Every place' }));
    expect(screen.getByRole('heading', { name: 'Mount Reikon' })).toBeInTheDocument();
  });

  it('walks the road to the coast and takes a room at the inn', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    const toPort = async () => {
      await user.click(screen.getByRole('button', { name: /Travel/ }));
      const port = screen.getByRole('heading', { name: 'Port Shiomachi' }).closest('article')!;
      return within(port).getByRole('button', { name: 'Set out' });
    };
    // A genin goes on their sensei's pass, signed at the weekly lesson.
    expect(await toPort()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Here/ }));
    await user.click(place(/Training Grounds/));
    const sensei = within(screen.getByRole('region', { name: 'People here' })).getAllByRole(
      'article',
    )[0]!;
    const lesson = within(sensei)
      .getAllByRole('button', { name: /^Train / })
      .find((b) => !(b as HTMLButtonElement).disabled)!;
    await user.click(lesson);
    await user.click(within(screen.getByRole('dialog')).getAllByRole('button')[0]!);
    await user.click(await toPort());
    // On the road: take the first way on until you arrive.
    for (let step = 0; step < 6 && screen.queryByRole('navigation', { name: 'Choices' }); step++) {
      const choices = screen.getByRole('navigation', { name: 'Choices' });
      await user.click(within(choices).getAllByRole('button')[0]!);
    }
    await user.click(screen.getByRole('button', { name: /Here/ }));
    await user.click(place(/Gull/));
    expect(screen.getByRole('button', { name: 'Take a room and sleep till dawn' })).toBeEnabled();

    // Home again: the village says what it did without you.
    await user.click(screen.getByRole('button', { name: /Travel/ }));
    const home = screen.getByRole('heading', { name: 'Tōrōgakure' }).closest('article')!;
    await user.click(within(home).getByRole('button', { name: 'Set out' }));
    for (let step = 0; step < 6 && screen.queryByRole('navigation', { name: 'Choices' }); step++) {
      const choices = screen.getByRole('navigation', { name: 'Choices' });
      await user.click(within(choices).getAllByRole('button')[0]!);
    }
    expect(within(screen.getByRole('dialog')).getByText('Home to Tōrōgakure')).toBeInTheDocument();
  });

  it(
    'opens every dock tab and place without crashing',
    async () => {
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
    },
    VISIT_EVERYTHING_TIMEOUT,
  );

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
    // Who's here shows the people you know out and about: your team, not every stranger.
    const around = screen.getByRole('region', { name: 'Who’s here' });
    expect(within(around).queryByRole('button', { name: /Kaen/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: /Bonds/ }));
    expect(screen.getByRole('heading', { name: 'Your team' })).toBeInTheDocument();
    await user.click(screen.getByText(/more to meet around the village/));
    await user.click(screen.getByRole('button', { name: /Kaen/ }));
    // A stranger's profile is short: who they are, what knowing them opens, a read of them.
    expect(screen.getByRole('region', { name: 'Between you' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Where to find them' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Talk to Kaen' }));
    await user.click(screen.getByRole('button', { name: /Bet I can beat you anyway/ }));
    expect(screen.getByText(/^\+\d+ bond$/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Say goodbye' }));
    expect(screen.getByRole('heading', { name: 'The people in your life' })).toBeInTheDocument();
  });

  it('walks through the clans’ quarter to a compound’s gate, and back', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(place(/Clan Quarter/));
    await user.click(screen.getByRole('button', { name: /Tōkaku Compound/ }));
    // The Tōkaku keep strangers out; the gate says why.
    expect(screen.getByText(/let in only those who are close friends/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /The quarter/ }));
    expect(screen.getByRole('button', { name: /Hibana Compound/ })).toBeInTheDocument();
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

  it('reads out the year’s honours before the teams', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await user.click(screen.getByRole('button', { name: /^New game/ }));
    await user.click(screen.getByRole('button', { name: /Land of Embers/ }));
    await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    await user.click(screen.getAllByRole('button', { name: /%/ })[0]!);
    await user.click(screen.getByRole('button', { name: 'Find your file' }));
    await user.type(screen.getByLabelText('Given name'), 'Aoi');
    for (let page = 0; page < 10; page++) {
      await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    }
    await user.click(screen.getByRole('button', { name: /forehead protector/i }));
    await user.click(screen.getByRole('button', { name: 'Hear the honours' }));
    const honours = screen.getByRole('region', { name: 'Honours' });
    expect(within(honours).getByText('Top of the year')).toBeInTheDocument();
    expect(within(honours).getByText('You')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Hear the teams' }));
    expect(screen.getAllByRole('button', { name: /^Train under/ }).length).toBeGreaterThan(0);
  });

  it('closes the day at bedtime with a sheet of what happened, and the day ahead', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(place(/Home/));
    await user.click(screen.getAllByRole('button', { name: 'Sleep till dawn' })[0]!);
    const sheet = screen.getByRole('dialog');
    expect(within(sheet).getByText(/draws to a close/)).toBeInTheDocument();
    expect(within(sheet).getByRole('region', { name: 'Tomorrow' })).toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: 'Sleep' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the settings from the Shinobi tab, with the save’s own settings', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(screen.getByRole('button', { name: 'Shinobi' }));
    await user.click(screen.getByRole('button', { name: /^Settings/ }));
    expect(screen.getByRole('region', { name: 'Sound' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'This save' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Animations on/ }));
    expect(screen.getByRole('button', { name: /Animations off/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('button', { name: 'Main menu' })).toBeInTheDocument();
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
    const defence = screen.getByRole('combobox', { name: 'Defence' });
    await user.selectOptions(defence, 'ready:far:dodge');
    expect(screen.getByRole('combobox', { name: 'Defence' })).toHaveValue('ready:far:dodge');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Fight at' }), 'keep:far:far');
    expect(screen.getByText('Back off first whenever closer')).toBeInTheDocument();
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
    await user.click(within(bento).getByRole('button', { name: 'Cook as usual' }));
    expect(screen.getByText(/Today you ate/)).toBeInTheDocument();
  });

  it('buys a cookbook at the grocer, and the cookbook shows what it taught', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(place(/Market Street/));
    await user.click(screen.getByRole('button', { name: /The Everyday Kitchen/ }));
    await user.click(screen.getByRole('button', { name: 'Shinobi' }));
    const book = screen.getByRole('region', { name: 'Cookbook' });
    expect(within(book).getByText('Grilled Fish Set')).toBeInTheDocument();
    expect(within(book).getByText(/dishes you have yet to learn/)).toBeInTheDocument();
    expect(within(book).getByText(/Tsune teaches it once you are friends/)).toBeInTheDocument();
  });

  it('cooks by hand at the stove, three beats at a time', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(place(/Market Street/));
    await user.click(screen.getByRole('button', { name: /^8\s*Rice\s*For cooking/ }));
    await user.click(screen.getByRole('button', { name: /^8\s*Rice\s*1 at home/ }));
    await user.click(screen.getByRole('button', { name: /Here/ }));
    await user.click(place(/^Home/));
    const bento = screen
      .getAllByRole('article')
      .find((a) => a.textContent.includes('Rice Ball Bento'))!;
    await user.click(within(bento).getByRole('button', { name: 'At the stove' }));
    const stove = screen.getByRole('region', { name: /at the stove/ });
    expect(within(stove).getByRole('button', { name: 'Cook it' })).toBeDisabled();
    await user.click(within(stove).getByRole('button', { name: 'Whole' }));
    await user.click(within(stove).getByRole('button', { name: 'Steady' }));
    await user.click(within(stove).getByRole('button', { name: 'On time' }));
    await user.click(within(stove).getByRole('button', { name: 'Cook it' }));
    expect(screen.getByText(/Today you ate/)).toBeInTheDocument();
  });

  it('forages in the woods and casts a line on the river', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(place(/Lantern Woods/));
    expect(screen.getByText(/About now/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByText(/already searched Lantern Woods today/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Here/ }));
    await user.click(place(/River Below the Canal/));
    expect(screen.getAllByRole('button', { name: 'Cast a line' })).toHaveLength(3);
  });

  it('resumes a saved game', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    const first = render(<App store={store} />);
    await startGame(user);
    first.unmount();
    render(<App store={store} />);
    expect(screen.getByRole('button', { name: /^Continue.*Aoi/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Continue/ }));
    expect(screen.getByRole('heading', { name: 'Tōrōgakure' })).toBeInTheDocument();
  });

  it('goes back to the main menu from the game, and asks before replacing the save', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await startGame(user);
    await user.click(screen.getByRole('button', { name: 'Shinobi' }));
    await user.click(screen.getByRole('button', { name: 'Main menu' }));
    await user.click(screen.getByRole('button', { name: /^New game/ }));
    expect(screen.getByText(/A new game replaces Aoi/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Keep Aoi/ }));
    await user.click(screen.getByRole('button', { name: /^Continue/ }));
    expect(screen.getByRole('heading', { name: 'Tōrōgakure' })).toBeInTheDocument();
  });

  it('plays a versus bout between two of the pack’s fighters, and offers a rematch', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    render(<App store={store} />);
    await user.click(screen.getByRole('button', { name: /^Versus/ }));
    await user.selectOptions(screen.getByLabelText('You fight as'), 'person:kakashi');
    await user.selectOptions(screen.getByLabelText('Opponent 1'), 'person:guy');
    await user.click(screen.getByRole('button', { name: 'Fight' }));
    expect(screen.getAllByText(/Might Guy/).length).toBeGreaterThan(0);
    expect(store.data).toBeNull();
  });

  it('lets you watch a versus bout play itself out', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await user.click(screen.getByRole('button', { name: /^Versus/ }));
    await user.selectOptions(screen.getByLabelText('You fight as'), 'person:kakashi');
    await user.selectOptions(screen.getByLabelText('Opponent 1'), 'person:guy');
    await user.click(screen.getByRole('button', { name: 'Watch them fight' }));
    expect(screen.getByRole('button', { name: 'Watch to the end' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Begin the fight/ })).toBeNull();
  });

  it('sets up a team versus bout, and says why a side won’t do', async () => {
    const user = userEvent.setup();
    render(<App store={memoryStore()} />);
    await user.click(screen.getByRole('button', { name: /^Versus/ }));
    await user.selectOptions(screen.getByLabelText('You fight as'), 'person:kakashi');
    await user.click(screen.getByRole('button', { name: 'Add an ally' }));
    expect(screen.getByText('Kakashi Hatake can’t stand twice on one side.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fight' })).toBeDisabled();
    await user.selectOptions(screen.getByLabelText('Ally 2'), 'person:naruto');
    await user.selectOptions(screen.getByLabelText('Opponent 1'), 'enemy:zabuza');
    await user.click(screen.getByRole('button', { name: 'Add an opponent' }));
    await user.selectOptions(screen.getByLabelText('Opponent 2'), 'enemy:haku');
    await user.click(screen.getByRole('button', { name: 'Fight' }));
    expect(screen.getAllByText(/Zabuza Momochi/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Haku/).length).toBeGreaterThan(0);
  });

  it('lets you start dead last, and your file and sheet say so', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    render(<App store={store} />);
    await user.click(screen.getByRole('button', { name: /^New game/ }));
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
    for (let page = 0; page < 6; page++) {
      await user.click(screen.getByRole('button', { name: 'Turn the page' }));
    }
    expect(screen.getByText('Dead last')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /forehead protector/i }));
    expect(store.data).toContain('"classStanding":"dead-last"');
    await formTeam(user);
    await user.click(screen.getByRole('button', { name: 'Shinobi' }));
    expect(screen.getByText('Dead last')).toBeInTheDocument();
    // The chakra paper has told you your nature.
    expect(screen.queryByText('Not yet tested')).toBeNull();
  });

  it('creates a clan character, raised by the clan, with a file written by hand', async () => {
    const user = userEvent.setup();
    const store = memoryStore();
    render(<App store={store} />);
    await user.click(screen.getByRole('button', { name: /^New game/ }));
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
    for (let page = 0; page < 6; page++) {
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
