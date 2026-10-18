// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ctx, newGame } from '@/test/gameFixtures';

import { RecordScreen } from './screens/RecordScreen';

/** The record's field book: its page tabs, a filled entry and a hinted empty one. */
describe('the field book (smoke test)', () => {
  it('opens from the record and turns to each page', async () => {
    const user = userEvent.setup();
    const game = newGame();
    const state = {
      ...game,
      fieldBook: {
        ...game.fieldBook,
        catches: { sweetfish: { count: 2, best: 24, bestDay: 3 } },
        foes: { 'bandit-thug': { fought: 2, beaten: 1 } },
      },
    };
    render(<RecordScreen ctx={ctx} state={state} perform={() => undefined} />);
    await user.click(screen.getByRole('tab', { name: 'Field book' }));
    const fish = screen.getByRole('tabpanel', { name: /Fish/ });
    expect(within(fish).getByText('Sweetfish')).toBeInTheDocument();
    expect(within(fish).getByText('Best 24 cm')).toBeInTheDocument();
    expect(within(fish).getAllByText('Not yet caught').length).toBeGreaterThan(0);
    expect(within(fish).getByText('Gyotaku print')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /Foes/ }));
    const foes = screen.getByRole('tabpanel', { name: /Foes/ });
    expect(within(foes).getByText('Bandit Thug')).toBeInTheDocument();
    expect(within(foes).getByText('1 of 12 kinds beaten')).toBeInTheDocument();
  });
});
