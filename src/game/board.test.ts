import { ctx, formTeam, freshGame, act, veteran } from '@/test/gameFixtures';

import { availability, boardFor } from './board';
import { blockerFor } from './dispatch';
import { deserialize, serialize } from './persistence/save';
import type { GameState } from './state';
import { missionBoardView } from './views/boards';

/** A real game (no forced postings) on the given day. */
function onDay(day: number, start: GameState = formTeam(freshGame())): GameState {
  return { ...start, time: { day, slot: 0 } };
}

const titles = (state: GameState) => missionBoardView(state, ctx)!.notices.map((n) => n.id);

describe('the jobs board', () => {
  it('always has the standing patrol and at least two postings', () => {
    for (let day = 1; day <= 30; day++) {
      const ids = titles(onDay(day));
      expect(ids).toContain('lantern-patrol');
      expect(ids.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('never posts jobs you are not trusted with', () => {
    for (let day = 1; day <= 30; day++) {
      expect(titles(onDay(day))).not.toContain('storehouse-ghost');
    }
    const trusted = veteran(onDay(1), 3);
    const everSeen = new Set(
      Array.from({ length: 30 }, (_, d) =>
        titles({ ...trusted, time: { day: d + 1, slot: 0 } }),
      ).flat(),
    );
    expect(everSeen.has('storehouse-ghost')).toBe(true);
  });

  it('jobs come and go', () => {
    const veteranGame = veteran(onDay(1), 4);
    const boards = Array.from({ length: 12 }, (_, d) =>
      titles({ ...veteranGame, time: { day: d + 1, slot: 0 } }).join(','),
    );
    expect(new Set(boards).size).toBeGreaterThan(3);
  });

  it('is the same for the same save and day, and differs between saves', () => {
    const a = onDay(5);
    expect(boardFor(a, ctx)).toEqual(boardFor(a, ctx));
    const other = { ...a, board: { ...a.board, seed: a.board.seed + 1 } };
    const days = Array.from({ length: 10 }, (_, d) => d + 1);
    const differs = days.some(
      (day) =>
        titles({ ...veteran(a, 4), time: { day, slot: 0 } }).join() !==
        titles({ ...veteran(other, 4), time: { day, slot: 0 } }).join(),
    );
    expect(differs).toBe(true);
  });

  it('a taken posting comes down; a standing job waits until tomorrow', () => {
    const state = onDay(1);
    const posted = missionBoardView(state, ctx)!.notices.find((n) => !n.standing)!;
    const took = act(state, { type: 'startMission', missionId: posted.id });
    const def = ctx.content.missions.require(posted.id);
    expect(availability(took, ctx, def).kind).toBe('absent');

    const patrol = act(state, { type: 'startMission', missionId: 'lantern-patrol' });
    const back = { ...patrol, mission: null };
    expect(blockerFor(back, { type: 'startMission', missionId: 'lantern-patrol' }, ctx)).toBe(
      'You’ve done that today. Come back tomorrow.',
    );
  });

  it('notices say how long they stay up', () => {
    const notices = missionBoardView(onDay(1), ctx)!.notices;
    expect(notices.find((n) => n.standing)?.posted).toBe('Standing job');
    expect(
      notices.filter((n) => !n.standing).every((n) => /Last day|Gone after|Up for/.test(n.posted)),
    ).toBe(true);
  });

  it('a version 6 save gets a board', () => {
    const { board: _board, ...v6 } = onDay(3);
    const loaded = deserialize(JSON.stringify({ version: 6, state: v6 }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(titles(loaded.value)).toContain('lantern-patrol');
    expect(deserialize(serialize(loaded.value))).toEqual(loaded);
  });
});
