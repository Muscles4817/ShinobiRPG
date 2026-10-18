// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { contextForPack, type GameAction } from '@/game';
import { ctx, newGame } from '@/test/gameFixtures';

import { ContractCard } from './components/ContractCard';
import { PersonSheet } from './components/PersonSheet';

const naruto = contextForPack('naruto')!;

/** A summoning contract on the Shinobi tab, and signing a teacher's (smoke test). */
describe('summoning contracts (smoke test)', () => {
  it('shows the contract, your standing and which summons answer you', () => {
    const state = {
      ...newGame(),
      contract: { contractId: 'kiln-salamanders', standing: 0, signedDay: 1 },
    };
    render(<ContractCard ctx={ctx} state={state} />);
    expect(screen.getByRole('heading', { name: 'The Salamanders of the Old Kilns' })).toBeTruthy();
    expect(screen.getByText('Kiln Newt')).toBeTruthy();
    expect(screen.getAllByText(/Answers once the clan counts you/).length).toBeGreaterThan(0);
  });

  it('shows nothing before you sign one', () => {
    const { container } = render(<ContractCard ctx={ctx} state={newGame()} />);
    expect(container.textContent).toBe('');
  });

  it('offers a teacher’s contract on their sheet, once you are close', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    const fresh = newGame({}, naruto);
    const bonds = { kakashi: { points: 60, lastTalkDay: null, heard: [] } };
    const state = {
      ...fresh,
      time: { ...fresh.time, slot: 1 },
      people: { ...fresh.people, bonds },
    };
    render(
      <PersonSheet
        ctx={naruto}
        state={state}
        personId="kakashi"
        perform={(a) => done.push(a)}
        onClose={() => undefined}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Sign Kakashi’s Ninken' }));
    expect(done).toEqual([{ type: 'signContract', personId: 'kakashi' }]);
  });
});
