// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { GameAction } from '@/game';
import { ctx, newGame } from '@/test/gameFixtures';

import { JutsuScreen } from './screens/YouScreens';

const MOVES = ['shoulder-throw', 'crescent-drop', 'post-sweep', 'ferrymans-shove'];

/** Your style on the Jutsu tab, and putting a move in it (smoke test). */
describe('your style (smoke test)', () => {
  it('shows the moves your strike plays from, and puts one in or takes one out', async () => {
    const user = userEvent.setup();
    const state = newGame();
    const known = [...new Set([...state.techniques.known, ...MOVES])];
    const done: GameAction[] = [];
    render(
      <JutsuScreen
        ctx={ctx}
        state={{ ...state, techniques: { ...state.techniques, known } }}
        perform={(a) => done.push(a)}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Your style' })).toBeTruthy();
    expect(screen.getByText(/With bare hands you throw/)).toBeTruthy();
    expect(screen.getAllByText('Style').length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: /Shoulder Throw/ }));
    const toggle = screen.getByRole('button', { name: /your style$/ });
    if (toggle.hasAttribute('disabled')) {
      // A full style says why, and what fixes it.
      expect(screen.getByText(/Take one out first/)).toBeTruthy();
      return;
    }
    await user.click(toggle);
    expect(done).toEqual([expect.objectContaining({ type: 'setStyleMove' })]);
  });

  it('builds a chain, saying whether each move follows the last, and keeps it', async () => {
    const user = userEvent.setup();
    const state = newGame();
    const known = [
      ...new Set([
        ...state.techniques.known,
        'post-sweep',
        'crescent-drop',
        'shoulder-throw',
        'arm-lock',
      ]),
    ];
    const stats = { ...state.character.stats, taijutsu: 16 };
    const done: GameAction[] = [];
    render(
      <JutsuScreen
        ctx={ctx}
        state={{
          ...state,
          character: { ...state.character, stats },
          techniques: { ...state.techniques, known },
        }}
        perform={(a) => done.push(a)}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Your chains' })).toBeTruthy();
    const moves = within(screen.getByRole('group', { name: 'Moves for a chain' }));
    await user.click(moves.getByRole('button', { name: 'Shoulder Throw' }));
    await user.click(moves.getByRole('button', { name: 'Crescent Drop' }));
    expect(screen.getByText(/leaves them at mid/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Start again' }));
    await user.click(moves.getByRole('button', { name: 'Arm Lock' }));
    await user.click(moves.getByRole('button', { name: 'Post Sweep' }));
    expect(screen.getByText('Arm Lock into Post Sweep')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Keep this chain' }));
    expect(done).toContainEqual({
      type: 'keepChain',
      techniqueIds: ['arm-lock', 'post-sweep'],
    });
  });
});
