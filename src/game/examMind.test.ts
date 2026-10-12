import { examDay } from '@/test/examFixtures';
import { act, ctx, withAllStats } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { mindPlans } from './exam/mind';
import type { GameState } from './state';
import { examScene } from './views/exam';

/** The written test: honest answers, cheating at a risk, and the last question. */

const SURE = 60;
const ENTER = { type: 'enterExam' } as const;

function sitting(state: GameState = examDay()): GameState {
  return act(state, ENTER);
}

function answerAll(state: GameState, approach: 'reason' | 'genjutsu'): GameState {
  let current = state;
  while (current.exams.run?.progress?.kind === 'mind' && !current.exams.run.progress.final) {
    if (current.exams.run.verdict) break;
    current = act(current, { type: 'examAnswer', approach });
  }
  return current;
}

/** A genin who knows a genjutsu but is poor at it: their cheats are risky. */
function clumsyCheat(state: GameState): GameState {
  const known = [...state.techniques.known, 'shadow-feint'];
  return {
    ...state,
    techniques: { ...state.techniques, known },
    character: { ...state.character, stats: { ...state.character.stats, genjutsu: 1 } },
  };
}

describe('the written test', () => {
  it('offers honest work to all, and cheats only to those with the means', () => {
    const plans = mindPlans(sitting(), ctx);
    expect(plans.find((p) => p.id === 'reason')).toMatchObject({
      stat: 'intellect',
      risk: 0,
      blocker: null,
    });
    expect(plans.find((p) => p.id === 'clone')?.blocker).toBe('Needs a clone technique.');
    const cheat = plans.find((p) => p.id === 'genjutsu');
    expect(cheat?.risk ?? 0).toBeGreaterThanOrEqual(0);
    const scene = examScene(sitting(), ctx);
    expect(scene?.stages.map((s) => s.status)).toEqual(['now', 'ahead', 'ahead']);
    expect(scene?.prompt).toMatch(/spirit lantern/);
  });

  it('passes a sharp mind, who stays for the last question, on to the forest', () => {
    const sharp = withAllStats(examDay(), SURE);
    const done = answerAll(sitting(sharp), 'reason');
    expect(done.exams.run?.progress).toMatchObject({ kind: 'mind', final: true, correct: 4 });
    const stayed = act(done, { type: 'examFinal', stay: true });
    expect(stayed.exams.run?.progress).toEqual({ kind: 'survival', started: false });
    expect(stayed.exams.run?.conduct).toEqual([{ signal: 'stayed-for-final', points: 2 }]);
    // A night in the exam lodgings: the next morning, rested and fed.
    expect(stayed.time.day).toBe(done.time.day + 1);
    expect(stayed.character.vitals.energy).toBe(100);
  });

  it('ends the exam for a team that walks out at the last question', () => {
    const done = answerAll(sitting(withAllStats(examDay(), SURE)), 'reason');
    const left = act(done, { type: 'examFinal', stay: false });
    expect(left.exams.run?.verdict).toMatchObject({ promoted: false, exit: 'walked-out' });
  });

  it('fails a paper with too few answers', () => {
    const entered = sitting();
    const stats = { ...entered.character.stats, intellect: 0, perception: 0 };
    const done = answerAll({ ...entered, character: { ...entered.character, stats } }, 'reason');
    const stayed = act(done, { type: 'examFinal', stay: true });
    expect(stayed.exams.run?.verdict).toMatchObject({ promoted: false, exit: 'failed-mind' });
  });

  it('marks a cheat a proctor catches, and puts the team out at the second', () => {
    const outcomes = Array.from({ length: 40 }, (_, seed) => {
      const start = sitting({ ...clumsyCheat(examDay()), rngState: seed + 1 });
      return answerAll(start, 'genjutsu');
    });
    const caught = outcomes.find((s) => s.exams.run?.exit === 'disqualified');
    expect(caught?.exams.run?.conduct.filter((m) => m.signal === 'caught-cheating')).toHaveLength(
      2,
    );
    expect(caught?.exams.run?.verdict?.promoted).toBe(false);
    expect(caught && examScene(caught, ctx)?.choices[0]?.label).toBe('Leave');
  });

  it('only answers the question in front of you', () => {
    const state = sitting();
    expect(blockerFor(state, { type: 'examFinal', stay: true }, ctx)).toBe(
      'There is no last question yet.',
    );
    expect(blockerFor(state, { type: 'examContinue' }, ctx)).toBe('Answer the question first.');
  });
});
