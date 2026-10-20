// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { GameAction } from '@/game';
import { ctx, newGame } from '@/test/gameFixtures';

import { RiteCards } from './components/RiteCard';

/** A learned hive rite on the Shinobi tab, taken at a share (smoke test). */
describe('hive rites (smoke test)', () => {
  it('offers the three shares of a learned rite and takes the one tapped', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    const state = { ...newGame(), rites: ['toga'] };
    render(<RiteCards ctx={ctx} state={state} perform={(a) => done.push(a)} />);
    expect(screen.getByRole('heading', { name: 'The Lamp Vigil' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Give it half' }));
    expect(done).toEqual([{ type: 'takeHive', clanId: 'toga', share: 'half' }]);
  });

  it('shows nothing once you carry a hive', () => {
    const state = {
      ...newGame(),
      rites: ['toga'],
      hive: { strainId: 'lantern-moth', share: 'half' as const, count: 10 },
    };
    const { container } = render(<RiteCards ctx={ctx} state={state} perform={() => undefined} />);
    expect(container.textContent).toBe('');
  });
});
