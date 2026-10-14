import { createRng } from '@/core';
import { act, ctx, newGame } from '@/test/gameFixtures';

import { dispatch } from './dispatch';
import { FULL_PROGRESS, hasMastered, practiseSession, progressOf } from './exercises';
import type { GameState } from './state';
import { trainingView } from './views/training';
import { canWalk } from './walking';

/** Chakra control at the bottom of grade D and of grade C (see `STAT_TIERS`). */
const GRADE_D = 8;
const GRADE_C = 13;

function withControl(state: GameState, chakraControl: number): GameState {
  const stats = { ...state.character.stats, chakraControl };
  return { ...state, character: { ...state.character, stats } };
}

const trees = ctx.content.exercises.require('tree-walking');
const practiseTrees = { type: 'practise', exerciseId: 'tree-walking' } as const;
const lesson = { type: 'trainWith', personId: 'goran', statId: 'taijutsu' } as const;

describe('chakra control exercises', () => {
  it('wait for the grade, and tree-walking for your sensei', () => {
    const low = withControl(newGame(), GRADE_D - 1);
    expect(dispatch(low, practiseTrees, ctx)).toEqual({
      ok: false,
      error: 'Tree-Walking takes chakra control at grade D.',
    });
    expect(dispatch(withControl(newGame(), GRADE_D), practiseTrees, ctx)).toEqual({
      ok: false,
      error: 'Your sensei starts Tree-Walking with you at a weekly lesson.',
    });
  });

  it('is started at the weekly lesson once you are ready', () => {
    const notYet = act(withControl(newGame(), GRADE_D - 1), lesson);
    expect(progressOf(notYet, 'tree-walking')).toBe(0);
    const begun = act(withControl(newGame(), GRADE_D), lesson);
    expect(progressOf(begun, 'tree-walking')).toBeGreaterThan(0);
    expect(begun.journal.entries.map((e) => e.heading)).toContain('Tree-Walking');
    expect(dispatch(begun, practiseTrees, ctx).ok).toBe(true);
  });

  it('builds over sessions to mastery: a breakthrough, and the trees are yours', () => {
    let state = act(withControl(newGame(), GRADE_D), lesson);
    let sessions = 0;
    for (; !hasMastered(state, trees) && sessions < 40; sessions++) {
      state = practiseSession(state, trees, createRng(sessions)).state;
    }
    expect(sessions).toBeGreaterThan(2);
    expect(progressOf(state, 'tree-walking')).toBe(FULL_PROGRESS);
    expect(state.character.breakthroughs.map((b) => b.source)).toContain('exercise:tree-walking');
    expect(canWalk(state, ctx, 'trees')).toBe(true);
    expect(canWalk(state, ctx, 'water')).toBe(false);
  });

  it('goes faster with control past the grade it needs', () => {
    const started = act(withControl(newGame(), GRADE_D), lesson);
    const atGrade = practiseSession(started, trees, createRng(99));
    const better = practiseSession(withControl(started, GRADE_C), trees, createRng(99));
    expect(progressOf(better.state, 'tree-walking')).toBeGreaterThan(
      progressOf(atGrade.state, 'tree-walking'),
    );
  });

  it('shows on the training page, with what it takes', () => {
    const view = trainingView(withControl(newGame(), GRADE_D), ctx);
    expect(view?.exercises).toMatchObject([
      {
        id: 'tree-walking',
        progress: 0,
        mastered: false,
        blocker: 'Your sensei starts Tree-Walking with you at a weekly lesson.',
      },
    ]);
  });
});
