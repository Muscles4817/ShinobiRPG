// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { dayEndView, type GameAction, type GameState } from '@/game';
import { act, ctx, newGame } from '@/test/gameFixtures';

import { DaySheet } from './components/day/DaySheet';
import { MorningSlip } from './screens/MorningSlip';
import { SettingsPanel } from './screens/SettingsPanel';

/** The end of a day: the sheet at bedtime or dawn, the morning slip, and the setting. */

function pushedThrough(): GameState {
  const night = { ...newGame(), time: { day: 1, slot: 3 } };
  return act(night, { type: 'train', trainingId: 'rooftop-sprints' });
}

describe('the end of the day (smoke test)', () => {
  it('meets a night pushed through at dawn, with today ahead', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    render(<DaySheet view={dayEndView(pushedThrough(), ctx)!} perform={(a) => done.push(a)} />);
    const sheet = screen.getByRole('dialog', { name: 'Dawn, and no sleep' });
    expect(within(sheet).getByRole('region', { name: 'Today' })).toBeInTheDocument();
    expect(within(sheet).getByRole('region', { name: 'What grew' })).toBeInTheDocument();
    expect(within(sheet).getByText('No sleep')).toBeInTheDocument();
    expect(within(sheet).queryByRole('region', { name: 'Found' })).not.toBeInTheDocument();
    await user.click(within(sheet).getByRole('button', { name: 'Carry on' }));
    expect(done).toEqual([{ type: 'dismissDay' }]);
  });

  it('leaves a slip above the village the morning after, in the brief setting', () => {
    const brief = act(newGame(), { type: 'setDayEnd', mode: 'brief' });
    const view = dayEndView(act(brief, { type: 'sleep' }), ctx)!;
    render(<MorningSlip view={view} perform={() => undefined} />);
    const slip = screen.getByRole('region', { name: 'Yesterday' });
    expect(within(slip).getByText('Today:')).toBeInTheDocument();
    expect(within(slip).getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('offers the full sheet, a morning slip or nothing in the settings', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    render(<SettingsPanel ctx={ctx} state={newGame()} perform={(a) => done.push(a)} />);
    const picker = screen.getByRole('group', { name: 'End of the day' });
    expect(within(picker).getByRole('button', { name: /The full day/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(within(picker).getByRole('button', { name: /A morning slip/ }));
    expect(done).toEqual([{ type: 'setDayEnd', mode: 'brief' }]);
  });
});
