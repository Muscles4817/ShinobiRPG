// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';

import type { GameState } from '@/game';
import { act, ctx, newGame, veteran } from '@/test/gameFixtures';

import { CombatScene } from './CombatScene';

/** The team mission's fight, with the first teammate an illusionist who keeps to the back. */
function riverFight(): GameState {
  const start = newGame();
  const [first] = start.people.team?.teammateIds ?? [];
  const generated = start.people.generated.map((p) =>
    p.id === first ? { ...p, specialty: 'genjutsu' as const } : p,
  );
  let state = veteran({ ...start, people: { ...start.people, generated } }, 2);
  state = act(state, { type: 'startMission', missionId: 'river-road-bandits' });
  state = act(state, { type: 'missionContinue' });
  state = act(state, { type: 'missionChoose', approachIndex: 0 });
  return act(state, { type: 'missionContinue' });
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
});
