// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';

import type { GameState } from '@/game';
import { act, ctx, intoFight, newGame, veteran } from '@/test/gameFixtures';

import { CombatScene } from './CombatScene';

/** The team mission's fight, with the first teammate an illusionist who keeps to the back. */
function riverFight(start: GameState = newGame()): GameState {
  const [first] = start.people.team?.teammateIds ?? [];
  const generated = start.people.generated.map((p) =>
    p.id === first ? { ...p, specialty: 'genjutsu' as const } : p,
  );
  let state = veteran({ ...start, people: { ...start.people, generated } }, 2);
  state = act(state, { type: 'startMission', missionId: 'river-road-bandits' });
  state = act(state, { type: 'missionContinue' });
  state = act(state, { type: 'missionChoose', approachIndex: 0 });
  return intoFight(state);
}

describe('CombatScene (smoke test)', () => {
  it('shows both sides in their rows', () => {
    const state = riverFight();
    render(<CombatScene ctx={ctx} state={state} perform={() => undefined} />);
    const back = screen.getByRole('region', { name: 'Their back row' });
    expect(within(back).getByText('Bandit Archer')).toBeInTheDocument();
    const front = screen.getByRole('region', { name: 'Their front row' });
    expect(within(front).queryByText('Bandit Archer')).not.toBeInTheDocument();
    const team = screen.getByRole('region', { name: 'Your team' });
    expect(within(team).getByText('Back row')).toBeInTheDocument();
    expect(screen.getAllByText('Front row').length).toBeGreaterThan(0);
  });

  it('shows the team mark and each teammate’s stance, locked until they trust you', () => {
    render(<CombatScene ctx={ctx} state={riverFight()} perform={() => undefined} />);
    const orders = screen.getByRole('region', { name: 'Orders' });
    expect(
      within(orders).getByRole('combobox', { name: 'Mark for Team mark' }),
    ).toBeInTheDocument();
    expect(within(orders).getAllByText(/won't take orders from you yet/).length).toBeGreaterThan(0);
  });

  it('says once why the cards you could add are blocked, and the round once', () => {
    render(<CombatScene ctx={ctx} state={riverFight()} perform={() => undefined} />);
    expect(screen.getAllByText('Slots full. Take a card out first.')).toHaveLength(1);
    expect(screen.getAllByText(/^Round \d+$/)).toHaveLength(1);
  });

  it('lets you set a friend’s stance and cards', () => {
    const start = newGame();
    const [first] = start.people.team?.teammateIds ?? [];
    // A close friend (bond stage 3) lets you set their cards.
    const closeFriend = { points: 55, lastTalkDay: null, heard: [] };
    const bonds = { ...start.people.bonds, [first!]: closeFriend };
    const state = riverFight({ ...start, people: { ...start.people, bonds } });
    render(<CombatScene ctx={ctx} state={state} perform={() => undefined} />);
    const orders = screen.getByRole('region', { name: 'Orders' });
    expect(within(orders).getAllByRole('combobox', { name: /^Stance for / }).length).toBe(1);
    const whose = screen.getByRole('tablist', { name: 'Whose cards' });
    expect(within(whose).getByRole('tab', { name: 'Your cards' })).toBeInTheDocument();
  });
});
