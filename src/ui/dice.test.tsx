// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { tavernView, type GameAction } from '@/game';
import { ctx, newGame } from '@/test/gameFixtures';

import { DiceTable } from './screens/places/DiceTable';

/** The dice table at the back of the bar. */
describe('chō-han (smoke test)', () => {
  it('bets the chosen stake on the call you tap', async () => {
    const user = userEvent.setup();
    const state = { ...newGame({ wallet: { ryo: 300 } }), time: { day: 2, slot: 3 } };
    const view = tavernView(state, ctx)!.pastimes.find((p) => p.dice)!.dice!;
    const done: GameAction[] = [];
    render(<DiceTable view={view} perform={(a) => done.push(a)} />);
    await user.click(screen.getByRole('radio', { name: '60 ryo' }));
    await user.click(screen.getByRole('button', { name: /Han/ }));
    expect(done).toEqual([{ type: 'playDice', pastimeId: 'lantern-dice', call: 'odd', stake: 60 }]);
  });
});
