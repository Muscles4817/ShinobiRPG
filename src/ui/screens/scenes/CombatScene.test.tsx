// @vitest-environment jsdom
import { useState } from 'react';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { combatScene, type GameState } from '@/game';
import { atEncounter, capable, hardCtx, withStats } from '@/test/encounterFixtures';
import {
  act,
  classicCtx,
  ctx,
  intoFight,
  newGame,
  veteran,
  withAllStats,
} from '@/test/gameFixtures';

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

/** A classic (turn-by-turn) spar, a few turns in: the style that keeps the one-screen log. */
function classicSpar(turns: number): GameState {
  // The classic context starts new fights in the classic style.
  let state = act(
    withAllStats(newGame({}, classicCtx), 7),
    { type: 'spar', personId: 'kaen' },
    classicCtx,
  );
  for (let i = 0; i < turns; i++) state = classicTurn(state);
  return state;
}

function classicTurn(state: GameState): GameState {
  const options = combatScene(state, classicCtx)!.options.filter((o) => !o.disabledReason);
  const pick = options.find((o) => o.kind === 'basic') ?? options.find((o) => o.kind === 'end');
  return act(state, { type: 'combatAct', optionId: pick!.id }, classicCtx);
}

/** The scene with live state: what you press is played, as in the game. */
function Live({ start }: { readonly start: GameState }) {
  const [state, setState] = useState(start);
  return (
    <CombatScene
      ctx={ctx}
      state={state}
      perform={(action) => {
        setState((s) => act(s, action));
      }}
    />
  );
}

describe('CombatScene (smoke test)', () => {
  it('keeps the log’s earlier lines in place as new ones arrive, so only new lines rise in', () => {
    const state = classicSpar(6);
    const { container, rerender } = render(
      <CombatScene ctx={classicCtx} state={state} perform={() => undefined} />,
    );
    const lines = () => [...container.querySelectorAll('.combat-log > p')];
    const before = lines().map((p) => [p, p.textContent] as const);
    rerender(<CombatScene ctx={classicCtx} state={classicTurn(state)} perform={() => undefined} />);
    const kept = before.filter(([p]) => p.isConnected);
    expect(kept.length).toBeGreaterThan(0);
    for (const [p, text] of kept) expect(p.textContent).toBe(text);
  });

  it('plans, then plays what you chose on the stage, then offers what comes next', async () => {
    const user = userEvent.setup();
    render(<Live start={act(withAllStats(newGame(), 7), { type: 'spar', personId: 'kaen' })} />);
    await user.click(screen.getByRole('button', { name: /^Begin the fight/ }));
    await user.click(screen.getByRole('button', { name: 'Next exchange' }));
    expect(screen.getByText('First exchange')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Skip' }));
    expect(screen.getByRole('button', { name: 'Next exchange' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Their front row' })).toBeInTheDocument();
  });

  it('shows both sides in their rows, with the distance between them', () => {
    const state = riverFight();
    render(<CombatScene ctx={ctx} state={state} perform={() => undefined} />);
    const back = screen.getByRole('group', { name: 'Their back row' });
    expect(within(back).getByRole('button', { name: 'Bandit Archer' })).toBeInTheDocument();
    const front = screen.getByRole('group', { name: 'Their front row' });
    expect(within(front).queryByRole('button', { name: 'Bandit Archer' })).toBeNull();
    expect(screen.getByRole('group', { name: 'Your back row' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /^Fighting at \w+ range$/ })).toBeInTheDocument();
  });

  it('reads the foe you tap, and lists every foe’s next move', async () => {
    const user = userEvent.setup();
    render(<CombatScene ctx={ctx} state={riverFight()} perform={() => undefined} />);
    await user.click(screen.getByRole('button', { name: 'Bandit Archer' }));
    expect(screen.getByRole('region', { name: 'About Bandit Archer' })).toBeInTheDocument();
    const moves = screen.getByRole('region', { name: 'Their next moves' });
    expect(within(moves).getAllByRole('listitem').length).toBeGreaterThan(1);
  });

  it('shows the team mark and each teammate’s stance, locked until they trust you', () => {
    render(<CombatScene ctx={ctx} state={riverFight()} perform={() => undefined} />);
    const orders = screen.getByRole('region', { name: 'Orders' });
    expect(
      within(orders).getByRole('combobox', { name: 'Mark for Team mark' }),
    ).toBeInTheDocument();
    expect(within(orders).getAllByText(/won't take orders from you yet/).length).toBeGreaterThan(0);
  });

  it('your sensei leads a serious job, fighting beside you and taking no orders', () => {
    const state = riverFight();
    const sensei = ctx.content.people.require(state.people.team!.senseiId!);
    render(<CombatScene ctx={ctx} state={state} perform={() => undefined} />);
    const ours = screen.getByRole('group', { name: 'Your front row' });
    expect(within(ours).getByRole('button', { name: sensei.name })).toBeInTheDocument();
    const orders = screen.getByRole('region', { name: 'Orders' });
    expect(within(orders).getAllByText(/leads this mission/).length).toBeGreaterThan(0);
  });

  it('says plainly when foes saw you first', () => {
    const blind = withStats(capable(hardCtx), { perception: 1 });
    const state = atEncounter('academy-dropout', blind, hardCtx);
    render(<CombatScene ctx={hardCtx} state={state} perform={() => undefined} />);
    expect(screen.getByText(/They saw you first\./)).toBeInTheDocument();
    expect(screen.getByText('They move first.')).toBeInTheDocument();
  });

  it('says once why the cards you could add are blocked, and the round once', () => {
    // Fill the slots where the fight is, so every card left to add is blocked the same way.
    let state = riverFight();
    for (let i = 0; i < 8; i++) {
      const view = combatScene(state, ctx)!;
      const here = view.options.find(
        (o) =>
          o.kind === 'plan' &&
          o.group?.toLowerCase() === view.range &&
          o.id.startsWith('slot:') &&
          !o.selected &&
          !o.adjusts &&
          !o.disabledReason,
      );
      if (!here) break;
      state = act(state, { type: 'combatAct', optionId: here.id });
    }
    render(<CombatScene ctx={ctx} state={state} perform={() => undefined} />);
    expect(screen.getAllByText('Slots full. Take a card out first.')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { name: /^Plan round \d+$/ })).toHaveLength(1);
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
