// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { rivalryView, type GameAction, type GameState } from '@/game';
import { act, ctx, newGame } from '@/test/gameFixtures';

import { RivalrySection } from './components/RivalrySection';
import { RaceScene } from './screens/scenes/RaceScene';
import { RivalScene } from './screens/scenes/RivalScene';

/** Your rival's screens: a race leg by leg, a provocation, and settling it from their sheet. */
describe('the rival (smoke test)', () => {
  const ready = (state: GameState): GameState => ({
    ...state,
    rival: { ...state.rival!, lastChallengeDay: -5 },
  });

  it('runs a race leg with the move you tap, reading them as it begins', async () => {
    const user = userEvent.setup();
    const state = act(ready(newGame()), {
      type: 'challengeRival',
      contest: 'race',
      stakes: 'pride',
    });
    const done: GameAction[] = [];
    render(<RaceScene ctx={ctx} state={state} perform={(a) => done.push(a)} />);
    expect(screen.getByRole('heading', { name: 'The start' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'What you read' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Push/ }));
    expect(done).toEqual([{ type: 'runRaceLeg', move: 'push' }]);
  });

  it('answers a provocation, saying who on your team would like each reply', async () => {
    const user = userEvent.setup();
    const game = newGame();
    const state = {
      ...game,
      rival: { ...game.rival!, beat: { kind: 'provocation', id: 'took-job' } as const },
    };
    const done: GameAction[] = [];
    render(<RivalScene ctx={ctx} state={state} perform={(a) => done.push(a)} />);
    expect(screen.getByText(/took the job off the board/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Let it go/ }));
    expect(done).toEqual([{ type: 'answerRival', choiceIndex: 0 }]);
  });

  it('puts a challenge to them from their sheet, on the ground and stakes you pick', async () => {
    const user = userEvent.setup();
    const state = ready(newGame());
    const view = rivalryView(state, ctx, state.rival!.personId)!;
    const done: GameAction[] = [];
    let closed = false;
    render(
      <RivalrySection
        view={view}
        perform={(a) => done.push(a)}
        onClose={() => {
          closed = true;
        }}
      />,
    );
    await user.click(screen.getAllByRole('button', { name: /^For a purse/ })[1]!);
    expect(done).toEqual([{ type: 'challengeRival', contest: 'race', stakes: 'purse' }]);
    expect(closed).toBe(true);
  });
});
