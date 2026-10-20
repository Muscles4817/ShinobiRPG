// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
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
    expect(screen.getByText(/When you strike, you throw/)).toBeTruthy();
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
});
