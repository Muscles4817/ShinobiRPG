// @vitest-environment jsdom
import { useState } from 'react';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { combatScene, type GameAction, type GameState } from '@/game';
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
      thinking={false}
    />
  );
}

/**
 * The scene as the game plays it: a fight's step is played off the page's thread, so what you
 * press is out (`thinking`) until "Arrive" lands it. This step's result is the whole round, back
 * to the card table, as a step that ends a round lands.
 */
function Pending({ start }: { readonly start: GameState }) {
  const [state, setState] = useState(start);
  const [out, setOut] = useState<GameAction | null>(null);
  return (
    <>
      <CombatScene
        ctx={ctx}
        state={state}
        perform={(action) => {
          if (!out) setOut(action);
        }}
        thinking={out !== null}
      />
      <button
        type="button"
        onClick={() => {
          if (out) setState((s) => act(act(s, out), { type: 'combatAct', optionId: 'round' }));
          setOut(null);
        }}
      >
        Arrive
      </button>
    </>
  );
}

describe('CombatScene (smoke test)', () => {
  it('stages a round only once its lines arrive, so a step still out can’t skip it', async () => {
    const user = userEvent.setup();
    render(<Pending start={act(withAllStats(newGame(), 7), { type: 'spar', personId: 'kaen' })} />);
    await user.click(screen.getByRole('button', { name: /^Begin the fight/ }));
    // Nothing has come back yet: if the stage offered a way past it, take it, as a player would.
    const wayOn = /^(Plan the next round|Change your plan)$/;
    const offered = screen.queryByRole('button', { name: wayOn });
    if (offered) await user.click(offered);
    await user.click(screen.getByRole('button', { name: 'Arrive' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    expect(offered).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Skip' }));
    expect(screen.getByRole('button', { name: wayOn })).toBeInTheDocument();
  });

  it('offers no way on from the stage while the step asked for is still out', async () => {
    const user = userEvent.setup();
    const begun = act(withAllStats(newGame(), 7), { type: 'spar', personId: 'kaen' });
    render(<Pending start={act(begun, { type: 'combatAct', optionId: 'begin' })} />);
    await user.click(screen.getByRole('button', { name: 'Next exchange' }));
    expect(screen.getByRole('button', { name: 'Next exchange' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Watch the round' })).toBeDisabled();
  });

  it('closes the card table while the step asked for is still out', async () => {
    const user = userEvent.setup();
    render(<Pending start={act(withAllStats(newGame(), 7), { type: 'spar', personId: 'kaen' })} />);
    const cards = () => within(screen.getByRole('region', { name: 'Your cards' }));
    expect(cards().getAllByRole('button')[0]).toBeEnabled();
    await user.click(screen.getByRole('button', { name: /^Begin the fight/ }));
    expect(screen.getByRole('button', { name: /^Begin the fight/ })).toBeDisabled();
    expect(cards().getAllByRole('button')[0]).toBeDisabled();
  });

  it('keeps the log’s earlier lines in place as new ones arrive, so only new lines rise in', () => {
    const state = classicSpar(6);
    const { container, rerender } = render(
      <CombatScene ctx={classicCtx} state={state} perform={() => undefined} thinking={false} />,
    );
    const lines = () => [...container.querySelectorAll('.combat-log > p')];
    const before = lines().map((p) => [p, p.textContent] as const);
    rerender(
      <CombatScene
        ctx={classicCtx}
        state={classicTurn(state)}
        perform={() => undefined}
        thinking={false}
      />,
    );
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

  it('shows your bars exactly and a foe’s as your eyes read them', () => {
    const dull = act(withAllStats(newGame(), 3), { type: 'spar', personId: 'kaen' });
    render(<CombatScene ctx={ctx} state={dull} perform={() => undefined} thinking={false} />);
    const [mine, theirs] = within(
      screen.getByRole('region', { name: 'Every fighter’s bars' }),
    ).getAllByRole('article');
    expect(within(mine!).getByText('Chakra')).toBeInTheDocument();
    expect(within(mine!).getAllByText(/^\d+\/\d+$/).length).toBeGreaterThan(1);
    expect(within(theirs!).queryByText('Chakra')).toBeNull();
    expect(within(theirs!).queryAllByText(/^\d+\/\d+$/)).toHaveLength(0);
    expect(within(theirs!).getByText('Fresh')).toBeInTheDocument();
  });

  it('shows both sides in their rows, with the distance between them', () => {
    const state = riverFight();
    render(<CombatScene ctx={ctx} state={state} perform={() => undefined} thinking={false} />);
    const back = screen.getByRole('group', { name: 'Their back row' });
    expect(within(back).getByRole('button', { name: 'Bandit Archer' })).toBeInTheDocument();
    const front = screen.getByRole('group', { name: 'Their front row' });
    expect(within(front).queryByRole('button', { name: 'Bandit Archer' })).toBeNull();
    expect(screen.getByRole('group', { name: 'Your back row' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /^Fighting at \w+ range$/ })).toBeInTheDocument();
  });

  it('reads the foe you tap, and lists every foe’s next move', async () => {
    const user = userEvent.setup();
    render(
      <CombatScene ctx={ctx} state={riverFight()} perform={() => undefined} thinking={false} />,
    );
    await user.click(screen.getByRole('button', { name: 'Bandit Archer' }));
    expect(screen.getByRole('region', { name: 'About Bandit Archer' })).toBeInTheDocument();
    const moves = screen.getByRole('region', { name: 'Their next moves' });
    expect(within(moves).getAllByRole('listitem').length).toBeGreaterThan(1);
  });

  it('shows the team mark and each teammate’s stance, locked until they trust you', () => {
    render(
      <CombatScene ctx={ctx} state={riverFight()} perform={() => undefined} thinking={false} />,
    );
    const orders = screen.getByRole('region', { name: 'Orders' });
    expect(
      within(orders).getByRole('combobox', { name: 'Mark for Team mark' }),
    ).toBeInTheDocument();
    expect(within(orders).getAllByText(/won't take orders from you yet/).length).toBeGreaterThan(0);
  });

  it('your sensei leads a serious job, fighting beside you and taking no orders', () => {
    const state = riverFight();
    const sensei = ctx.content.people.require(state.people.team!.senseiId!);
    render(<CombatScene ctx={ctx} state={state} perform={() => undefined} thinking={false} />);
    const ours = screen.getByRole('group', { name: 'Your front row' });
    expect(within(ours).getByRole('button', { name: sensei.name })).toBeInTheDocument();
    const orders = screen.getByRole('region', { name: 'Orders' });
    expect(within(orders).getAllByText(/leads this mission/).length).toBeGreaterThan(0);
  });

  it('says plainly when foes saw you first', () => {
    const blind = withStats(capable(hardCtx), { perception: 1 });
    const state = atEncounter('academy-dropout', blind, hardCtx);
    render(<CombatScene ctx={hardCtx} state={state} perform={() => undefined} thinking={false} />);
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
    render(<CombatScene ctx={ctx} state={state} perform={() => undefined} thinking={false} />);
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
    render(<CombatScene ctx={ctx} state={state} perform={() => undefined} thinking={false} />);
    const orders = screen.getByRole('region', { name: 'Orders' });
    expect(within(orders).getAllByRole('combobox', { name: /^Stance for / }).length).toBe(1);
    const whose = screen.getByRole('tablist', { name: 'Whose cards' });
    expect(within(whose).getByRole('tab', { name: 'Your cards' })).toBeInTheDocument();
  });
});
