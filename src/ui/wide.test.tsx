// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { serialize, type SaveStore } from '@/game';
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

  it('keeps the phone layout as it was on a narrow screen', async () => {
    windowWide(false);
    const user = await openGame();
    expect(screen.queryByRole('complementary', { name: 'You' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /^Places in/ })).not.toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
    await user.keyboard('3');
    expect(screen.getByRole('button', { name: 'Here' })).toHaveAttribute('aria-current', 'page');
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
