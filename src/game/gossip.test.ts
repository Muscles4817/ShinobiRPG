import { ctx, newGame } from '@/test/gameFixtures';

import { newPostingsTomorrow } from './board';
import { stretchOf } from './gossip';
import type { GameState } from './state';
import { rumoursOverheard, rumoursToday } from './village';

/** The village's talk: never about a job already done, never the same line two days running. */

const at = (state: GameState, day: number, slot = 0): GameState => ({
  ...state,
  time: { day, slot },
  board: { ...state.board, refreshedDay: day },
});

const quiet = (): GameState => ({ ...newGame(), board: { ...newGame().board, postings: [] } });

/** A day whose gossip hints at a job going up tomorrow, and that job. */
function hintedDay(): { day: number; missionId: string } {
  for (let day = 2; day < 120; day++) {
    const tomorrow = new Set(newPostingsTomorrow(at(quiet(), day), ctx));
    const hint = rumoursToday(at(quiet(), day), ctx).find(
      (r) => r.missionId !== undefined && tomorrow.has(r.missionId),
    );
    if (hint?.missionId) return { day, missionId: hint.missionId };
  }
  throw new Error('no job was ever hinted at');
}

describe('the village’s talk', () => {
  it('never goes round about a job you have already done', () => {
    const { day, missionId } = hintedDay();
    const base = quiet();
    const done = { ...base, board: { ...base.board, completed: [missionId] } };
    const told = [...rumoursToday(at(done, day), ctx), ...rumoursOverheard(at(done, day, 3), ctx)];
    expect(told.map((r) => r.missionId)).not.toContain(missionId);
  });

  it('never tells the same line two days running', () => {
    const days = Array.from({ length: 40 }, (_, d) => d + 2);
    const said = days.map((d) => rumoursToday(at(newGame(), d), ctx).map((r) => r.text));
    const heard = days.map((d) => rumoursOverheard(at(newGame(), d, 3), ctx).map((r) => r.text));
    for (const lines of [said, heard]) {
      lines.slice(1).forEach((today, i) => {
        const yesterday = new Set(lines[i]);
        expect(today.filter((line) => yesterday.has(line))).toEqual([]);
      });
    }
  });

  it('still fills the day, and comes round to every line in time', () => {
    const lines = new Set(
      Array.from({ length: 60 }, (_, d) => rumoursToday(at(newGame(), d + 2), ctx))
        .flat()
        .map((r) => r.id),
    );
    expect(rumoursToday(at(newGame(), 5), ctx).length).toBe(3);
    expect(lines.size).toBeGreaterThan(10);
  });

  it('takes turns: a ring of one is told every other day, a longer one in stretches', () => {
    expect([0, 1, 2, 3].map((d) => stretchOf(['a'], d, 2))).toEqual([['a'], [], ['a'], []]);
    expect(stretchOf(['a', 'b', 'c'], 0, 3)).toEqual(['a']);
    expect(stretchOf(['a', 'b', 'c'], 1, 3)).toEqual(['b']);
    expect(stretchOf(['a', 'b', 'c', 'd', 'e', 'f'], 1, 3)).toEqual(['d', 'e', 'f']);
  });
});
