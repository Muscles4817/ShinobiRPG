// @vitest-environment jsdom
import { act as settle, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { serialize, type GameState, type Report, type SaveStore } from '@/game';
import { act, freshGame, newGame, pressOn, veteran } from '@/test/gameFixtures';

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

/** A window that starts wide (or not) and can be resized across the breakpoint while it is up. */
function resizableWindow(wide: boolean): (wide: boolean) => void {
  const listeners = new Set<() => void>();
  let isWide = wide;
  window.matchMedia = (query: string) =>
    ({
      matches: isWide && query.includes('min-width'),
      media: query,
      onchange: null,
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList; // a stand-in: jsdom has no matchMedia of its own
  return (next) => {
    isWide = next;
    settle(() => {
      for (const listener of listeners) listener();
    });
  };
}

async function openGame(game = newGame()) {
  const user = userEvent.setup();
  render(<App store={storeWith(serialize(game))} />);
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

  it('opens a person’s sheet beside the page, and closes it with Esc', async () => {
    windowWide(true);
    const user = await openGame();
    const around = screen.getByRole('region', { name: 'Who’s here' });
    await user.click(within(around).getAllByRole('button')[0]!);
    expect(document.querySelector('.person-sheet')).not.toBeNull();
    await user.keyboard('{Escape}');
    expect(document.querySelector('.person-sheet')).toBeNull();
  });

  it('sets the people beside the page of whoever is picked, and finds them by name', async () => {
    windowWide(true);
    const user = await openGame();
    await user.keyboard('4');
    const cards = () => [...document.querySelectorAll<HTMLElement>('.bonds-list .bond-card')];
    const shown = () => document.querySelector('.bonds-page h2')?.textContent ?? '';
    const [first, second] = cards();
    expect(first).toHaveAttribute('aria-current', 'true');
    expect(first).toHaveTextContent(shown());
    await user.hover(second!);
    expect(second).toHaveTextContent(shown());
    await user.unhover(second!);
    expect(first).toHaveTextContent(shown());
    await user.click(second!);
    expect(second).toHaveAttribute('aria-current', 'true');

    await user.type(screen.getByLabelText('Find someone by name'), 'zzzz');
    expect(screen.getByText('Nobody by that name. Try fewer letters.')).toBeInTheDocument();
  });

  it('previews a technique in the detail panel while it is pointed at', async () => {
    windowWide(true);
    const user = await openGame();
    await user.keyboard('3');
    const detail = () => document.querySelector('.detail-card b')?.textContent ?? '';
    const second = screen.getAllByRole('button', { name: /chakra/ })[1]!;
    const picked = detail();
    await user.hover(second);
    expect(detail()).not.toBe(picked);
    await user.unhover(second);
    expect(detail()).toBe(picked);
  });

  it('lists the journal’s days beside it, the latest marked', async () => {
    windowWide(true);
    const game = newGame();
    const nextDay = game.journal.entries.map((e, i) => ({ ...e, id: 1000 + i, day: e.day + 1 }));
    const user = await openGame({
      ...game,
      journal: { entries: [...game.journal.entries, ...nextDay], nextId: 2000 },
    });
    await user.keyboard('6');
    const days = screen.getByRole('navigation', { name: 'Days' });
    const listed = within(days).getAllByRole('button');
    expect(listed).toHaveLength(2);
    expect(listed[1]).toHaveAttribute('aria-current', 'true');
    await user.click(screen.getByRole('tab', { name: 'Field book' }));
    expect(screen.queryByRole('navigation', { name: 'Days' })).not.toBeInTheDocument();
  });

  it('keeps the phone layout as it was on a narrow screen', async () => {
    windowWide(false);
    const user = await openGame();
    expect(screen.queryByRole('complementary', { name: 'You' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /^Places in/ })).not.toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Record' }));
    expect(screen.queryByRole('navigation', { name: 'Days' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Bonds' }));
    expect(screen.queryByLabelText('Find someone by name')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Here' }));
    await user.keyboard('3');
    expect(screen.getByRole('button', { name: 'Here' })).toHaveAttribute('aria-current', 'page');
  });

  it('keeps a story scene where it was as the window crosses the breakpoint', async () => {
    const resize = resizableWindow(true);
    const user = await openGame(freshGame());
    await user.click(screen.getByRole('button', { name: 'Hear the honours' }));
    await user.click(screen.getByRole('button', { name: 'Hear the teams' }));
    // The scene's own node: a remount would draw a new one (and forget what it held).
    const heading = screen.getByRole('heading', { name: 'Team assignment' });
    resize(false);
    expect(screen.getByRole('heading', { name: 'Team assignment' })).toBe(heading);
    expect(screen.queryByRole('complementary', { name: 'You' })).not.toBeInTheDocument();
    resize(true);
    expect(screen.getByRole('heading', { name: 'Team assignment' })).toBe(heading);
    expect(screen.getByRole('complementary', { name: 'You' })).toBeInTheDocument();
  });

  describe('under a card laid over play', () => {
    const HOME: Report = { kind: 'home-again', place: 'Home', days: 2, news: [], text: 'Back.' };
    const onJob = () =>
      act(veteran(newGame(), 5), { type: 'startMission', missionId: 'tea-merchant-escort' });
    const dayEnded = (): GameState =>
      act(
        { ...newGame(), time: { day: 1, slot: 3 } },
        { type: 'train', trainingId: 'rooftop-sprints' },
      );

    it('keeps a scene’s number keys from reaching under a report', async () => {
      windowWide(true);
      const user = await openGame({ ...onJob(), reports: [HOME] });
      await user.keyboard('1');
      expect(screen.queryByRole('button', { name: /^Scan the ridgeline/ })).toBeNull();
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Continue' }),
      );
      await user.keyboard('1');
      expect(await screen.findByRole('button', { name: /^Scan the ridgeline/ })).toBeVisible();
    });

    it('keeps the dock’s number keys from switching tabs under the day’s sheet', async () => {
      windowWide(true);
      const user = await openGame(dayEnded());
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await user.keyboard('3');
      expect(screen.getByRole('button', { name: 'Jutsu' })).not.toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('keeps the dock’s number keys from switching tabs under a person’s sheet', async () => {
      windowWide(true);
      const user = await openGame();
      const around = screen.getByRole('region', { name: 'Who’s here' });
      await user.click(within(around).getAllByRole('button')[0]!);
      expect(document.querySelector('.person-sheet')).not.toBeNull();
      await user.keyboard('3');
      expect(screen.getByRole('button', { name: 'Jutsu' })).not.toHaveAttribute(
        'aria-current',
        'page',
      );
    });
  });

  describe('under a sheet', () => {
    it('keeps the dock’s number keys from switching tabs under a notice', async () => {
      windowWide(true);
      const user = await openGame();
      const rail = screen.getByRole('region', { name: /^Places in/ });
      await user.click(within(rail).getByRole('button', { name: /mission/i }));
      await user.click(document.querySelector<HTMLElement>('.board .paper, button.paper')!);
      expect(document.querySelector('.sheet')).not.toBeNull();
      await user.keyboard('3');
      expect(screen.getByRole('button', { name: 'Jutsu' })).not.toHaveAttribute(
        'aria-current',
        'page',
      );
      await user.keyboard('{Escape}');
      expect(document.querySelector('.sheet')).toBeNull();
      await user.keyboard('3');
      expect(screen.getByRole('button', { name: 'Jutsu' })).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('on the title menu', () => {
    function openMenu() {
      const user = userEvent.setup();
      render(<App store={storeWith(serialize(newGame()))} />);
      return user;
    }

    it('continues with Enter, and shows your save beside the list', async () => {
      windowWide(true);
      const user = openMenu();
      const continuing = screen.getByRole('region', { name: 'Continue' });
      expect(within(continuing).getByText(/^Day 1/)).toBeInTheDocument();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    });

    it('moves the mark with the arrows and asks before starting over', async () => {
      windowWide(true);
      const user = openMenu();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('region', { name: 'New game' })).toBeInTheDocument();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('group', { name: 'Start over?' })).toBeInTheDocument();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('group', { name: 'Start over?' })).toBeNull();
    });

    it('tells the choice pointed at', async () => {
      windowWide(true);
      const user = openMenu();
      await user.hover(screen.getByRole('button', { name: /Versus/ }));
      expect(screen.getByRole('region', { name: 'Versus' })).toBeInTheDocument();
      await user.keyboard('5');
      expect(screen.queryByRole('navigation', { name: 'Main menu' })).toBeNull();
    });

    it('leaves the keys alone on a phone', async () => {
      windowWide(false);
      const user = openMenu();
      await user.keyboard('1');
      expect(screen.getByRole('navigation', { name: 'Main menu' })).toBeInTheDocument();
    });
  });

  describe('on a job', () => {
    const onJob = () =>
      act(veteran(newGame(), 5), { type: 'startMission', missionId: 'tea-merchant-escort' });

    it('keeps who is along and the road so far beside the story', async () => {
      windowWide(true);
      await openGame(onJob());
      expect(screen.getByRole('region', { name: 'Who’s with you' })).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'Choices' })).toBeInTheDocument();
    });

    it('takes a choice with its number key', async () => {
      windowWide(true);
      const user = await openGame(onJob());
      await user.keyboard('1');
      expect(await screen.findByRole('button', { name: /^Scan the ridgeline/ })).toBeVisible();
    });

    it('leaves the number keys alone on a phone', async () => {
      windowWide(false);
      const user = await openGame(onJob());
      await user.keyboard('1');
      expect(screen.queryByRole('button', { name: /^Scan the ridgeline/ })).toBeNull();
    });

    it('leaves them to the debrief on a phone', async () => {
      windowWide(false);
      await openGame(onJob());
      expect(screen.queryByRole('region', { name: 'Who’s with you' })).not.toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'Choices' })).toBeInTheDocument();
    });
  });

  describe('in a fight', () => {
    const inFight = () => {
      let s = act(veteran(newGame(), 5), {
        type: 'startMission',
        missionId: 'tea-merchant-escort',
      });
      for (let i = 0; i < 20 && !s.combat; i++) s = pressOn(s);
      return s;
    };

    it('sets your cards beside the field, and keeps what was told beside the stage', async () => {
      windowWide(true);
      const user = await openGame(inFight());
      expect(screen.getByRole('region', { name: 'Your cards' })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Begin the fight' }));
      expect(await screen.findByRole('region', { name: 'So far' })).toBeInTheDocument();
    });

    it('keeps Enter from beginning the round under the fight guide', async () => {
      windowWide(true);
      const user = await openGame(inFight());
      await user.click(screen.getByRole('button', { name: 'How fighting works' }));
      // Off the guide's Close button, so Enter is the page's to take.
      await user.click(screen.getByRole('heading', { name: 'How fighting works' }));
      await user.keyboard('{Enter}');
      expect(screen.queryByRole('region', { name: 'So far' })).not.toBeInTheDocument();
      expect(screen.getByRole('dialog', { name: 'How fighting works' })).toBeInTheDocument();
    });

    it('begins the fight with Enter', async () => {
      windowWide(true);
      const user = await openGame(inFight());
      await user.keyboard('{Enter}');
      expect(await screen.findByRole('region', { name: 'So far' })).toBeInTheDocument();
    });

    it('shows the read of a fighter while it is pointed at', async () => {
      windowWide(true);
      const user = await openGame(inFight());
      const read = () => screen.getByRole('region', { name: /^About / }).getAttribute('aria-label');
      const picked = read();
      const archer = screen.getByRole('button', { name: /^Bandit Archer/ });
      await user.hover(archer);
      expect(read()).toMatch(/Archer/);
      await user.unhover(archer);
      expect(read()).toBe(picked);
    });

    const techniqueCard = () =>
      [...document.querySelectorAll<HTMLElement>('.plan-card')].find(
        (card) => card.dataset.discipline !== 'basic',
      )!;
    const techniqueRead = () => screen.queryByRole('region', { name: /^Technique: / });

    it('reads a technique card in full while it is pointed at', async () => {
      windowWide(true);
      const user = await openGame(inFight());
      const card = techniqueCard();
      await user.hover(card);
      expect(techniqueRead()).toHaveTextContent('Reach');
      expect(screen.queryByRole('region', { name: /^About / })).toBeNull();
      await user.unhover(card);
      expect(techniqueRead()).toBeNull();
      expect(screen.getByRole('region', { name: /^About / })).toBeInTheDocument();
    });

    it('reads no technique card on a phone', async () => {
      windowWide(false);
      const user = await openGame(inFight());
      await user.hover(techniqueCard());
      expect(techniqueRead()).toBeNull();
    });

    it('leaves the stage as it was on a phone', async () => {
      windowWide(false);
      const user = await openGame(inFight());
      await user.click(screen.getByRole('button', { name: 'Begin the fight' }));
      expect(screen.queryByRole('region', { name: 'So far' })).not.toBeInTheDocument();
    });
  });

  describe('in a talk', () => {
    async function startTalking(user: Awaited<ReturnType<typeof openGame>>) {
      const around = screen.getByRole('region', { name: 'Who’s here' });
      await user.click(within(around).getAllByRole('button')[0]!);
      await user.click(screen.getByRole('button', { name: /^Talk to/ }));
      return within(screen.getByRole('navigation', { name: 'Replies' })).getAllByRole('button')[0]!;
    }

    it('takes a reply with its number key', async () => {
      windowWide(true);
      const user = await openGame();
      const first = await startTalking(user);
      await user.keyboard('1');
      expect(first).not.toBeInTheDocument();
    });

    it('leaves the number keys alone on a phone', async () => {
      windowWide(false);
      const user = await openGame();
      const first = await startTalking(user);
      await user.keyboard('1');
      expect(first).toBeInTheDocument();
    });
  });

  describe('beside a story scene', () => {
    it('keeps the person you are talking to in view', async () => {
      windowWide(true);
      const user = await openGame();
      const around = screen.getByRole('region', { name: 'Who’s here' });
      await user.click(within(around).getAllByRole('button')[0]!);
      await user.click(screen.getByRole('button', { name: /^Talk to/ }));
      expect(screen.getByRole('complementary', { name: /^About / })).toBeInTheDocument();
    });

    it('keeps the job in view when foes are met on it', async () => {
      windowWide(true);
      let s = act(veteran(newGame(), 5), {
        type: 'startMission',
        missionId: 'tea-merchant-escort',
      });
      for (let i = 0; i < 20 && !s.mission?.encounter; i++) s = pressOn(s);
      await openGame(s);
      expect(screen.getByRole('complementary', { name: 'The job' })).toBeInTheDocument();
    });

    it('keeps you in view in the scenes about you', async () => {
      windowWide(true);
      await openGame(freshGame());
      expect(screen.getByRole('complementary', { name: 'You' })).toBeInTheDocument();
    });

    it('has no panel on a phone', async () => {
      windowWide(false);
      await openGame(freshGame());
      expect(screen.queryByRole('complementary', { name: 'You' })).not.toBeInTheDocument();
    });
  });
});
