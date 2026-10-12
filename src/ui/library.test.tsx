// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { GameAction, GameState, Report } from '@/game';
import { ctx, newGame, withAllStats } from '@/test/gameFixtures';

import { ReportCard } from './components/ReportCard';
import { HomePage } from './screens/places/HomePages';
import { LibraryPage } from './screens/places/LibraryPage';

/** The library's stacks, the reading desk for your own scrolls, and a mission's gifts. */

const ignore = () => undefined;

function ready(): GameState {
  return withAllStats(newGame(), 10);
}

function chunin(state: GameState): GameState {
  return { ...state, standing: { ...state.standing, rank: 'chunin' } };
}

describe('sources (smoke test)', () => {
  it('bars the stacks with a lattice until chūnin, then shelves them by art', async () => {
    const { unmount } = render(
      <LibraryPage ctx={ctx} state={ready()} perform={ignore} onBack={ignore} />,
    );
    const lattice = screen.getByRole('region', { name: 'Restricted stacks' });
    expect(
      within(lattice).getByText('The restricted stacks are for chūnin and above.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Study' })).toBeNull();
    unmount();

    const user = userEvent.setup();
    const done: GameAction[] = [];
    render(
      <LibraryPage
        ctx={ctx}
        state={chunin(ready())}
        perform={(a) => done.push(a)}
        onBack={ignore}
      />,
    );
    const ninjutsu = screen.getByRole('region', { name: 'Ninjutsu' });
    expect(within(ninjutsu).getByText(/Tide Lash/)).toBeInTheDocument();
    await user.click(within(ninjutsu).getAllByRole('button', { name: 'Study' })[0]!);
    expect(done[0]).toMatchObject({ type: 'study' });
  });

  it('reads a scroll you own at home', async () => {
    const user = userEvent.setup();
    const base = ready();
    const scrolls = { 'kindled-pulse': true as const };
    const state = { ...base, inventory: { ...base.inventory, scrolls } };
    const done: GameAction[] = [];
    render(<HomePage ctx={ctx} state={state} perform={(a) => done.push(a)} onBack={ignore} />);
    expect(screen.getByRole('button', { name: 'Read scrolls' })).toBeInTheDocument();
    const desk = screen.getByRole('region', { name: 'Your scrolls' });
    await user.click(within(desk).getByRole('button', { name: 'Study' }));
    expect(done).toEqual([{ type: 'studyScroll', techniqueId: 'kindled-pulse' }]);
  });

  it('shows a mission’s scroll and weapon on the debrief', () => {
    const report: Report = {
      kind: 'mission-complete',
      title: 'Festival Haunting',
      client: 'The shrine',
      ryo: 320,
      reputation: 8,
      missionsCompleted: 5,
      unlocked: [],
      scroll: 'Kindled Pulse',
      gear: 'The Hungry Lantern',
    };
    render(<ReportCard report={report} onContinue={ignore} />);
    const card = screen.getByRole('dialog');
    expect(within(card).getByText('Kindled Pulse')).toBeInTheDocument();
    expect(within(card).getByText('The Hungry Lantern')).toBeInTheDocument();
  });
});
