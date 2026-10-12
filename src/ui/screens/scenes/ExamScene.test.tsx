// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { GameAction, GameState } from '@/game';
import { examDay } from '@/test/examFixtures';
import { act, ctx } from '@/test/gameFixtures';

import { MissionHallPage } from '../places/MissionHallPage';
import { ExamScene } from './ExamScene';
import { PromotionScene } from './PromotionScene';

function promoted(): GameState {
  const entered = act(examDay(), { type: 'enterExam' });
  const run = entered.exams.run!;
  const verdict = { promoted: true, roundsWon: 2, conduct: 1, score: 5, exit: null };
  const over = {
    ...entered,
    exams: { ...entered.exams, run: { ...run, progress: null, verdict } },
  };
  return act(over, { type: 'examContinue' });
}

describe('exams (smoke test)', () => {
  it('pins the exam notice on the board and signs the team up', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    render(
      <MissionHallPage
        ctx={ctx}
        state={examDay()}
        perform={(a) => done.push(a)}
        onBack={() => undefined}
      />,
    );
    const notice = screen.getByRole('region', { name: 'The Lantern Trials' });
    expect(within(notice).getByText('Today')).toBeInTheDocument();
    expect(within(notice).getAllByText('Ready')).toHaveLength(2);
    await user.click(within(notice).getByRole('button', { name: 'Sign up as a team' }));
    expect(done).toEqual([{ type: 'enterExam' }]);
  });

  it('plays the written test: the stages, the question and the ways to answer', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    const state = act(examDay(), { type: 'enterExam' });
    render(<ExamScene ctx={ctx} state={state} perform={(a) => done.push(a)} />);
    const stages = screen.getByRole('list', { name: 'Stages' });
    expect(within(stages).getByText('The written paper')).toHaveClass('now');
    expect(screen.getByText(/spirit lantern burns blue/)).toBeInTheDocument();
    const choices = screen.getByRole('region', { name: 'Ways to answer' });
    const clone = within(choices).getByRole('button', { name: /Send a clone/ });
    expect(clone).toBeDisabled();
    expect(within(clone).getByText('Needs a clone technique.')).toBeInTheDocument();
    await user.click(within(choices).getByRole('button', { name: /Work it out/ }));
    expect(done).toEqual([{ type: 'examAnswer', approach: 'reason' }]);
  });

  it('reads out the verdict with the examiners’ notes', () => {
    const entered = act(examDay(), { type: 'enterExam' });
    const run = entered.exams.run!;
    const verdict = { promoted: false, roundsWon: 1, conduct: -2, score: 0, exit: null };
    const marks = [{ signal: 'caught-cheating', points: -2 } as const];
    const over = {
      ...entered,
      exams: { ...entered.exams, run: { ...run, progress: null, verdict, conduct: marks } },
    };
    render(<ExamScene ctx={ctx} state={over} perform={() => undefined} />);
    const slip = screen.getByRole('region', { name: 'Verdict' });
    expect(within(slip).getByText('Not this time')).toBeInTheDocument();
    expect(within(slip).getByText('Caught cheating')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Leave' })).toBeEnabled();
  });

  it('holds the promotion ceremony: title, vest and what it opens', async () => {
    const user = userEvent.setup();
    const done: GameAction[] = [];
    render(<PromotionScene ctx={ctx} state={promoted()} perform={(a) => done.push(a)} />);
    expect(screen.getByRole('heading', { name: 'Before the Tōrokage' })).toBeInTheDocument();
    expect(screen.getByText(/^Chūnin Kaito/)).toBeInTheDocument();
    expect(screen.getByText('Flak Vest')).toBeInTheDocument();
    const opens = screen.getByRole('region', { name: 'What this opens' });
    expect(within(opens).getByText(/Smugglers at the Weir/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Accept the rank of Chūnin/ }));
    expect(done).toEqual([{ type: 'acceptPromotion' }]);
  });
});
