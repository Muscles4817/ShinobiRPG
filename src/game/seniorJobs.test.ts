import { CONTENT_PACKS } from '@/content';
import { lowestRankFor } from '@/systems/missions';
import { act, newGame, veteran } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { jobOf } from './crew';
import { activeMission } from './missionFlow';
import type { GameState } from './state';
import { missionBoardView } from './views/boards';

/** The fan pack's senior work: B-rank for chūnin, A for jōnin or chūnin under one, S for jōnin. */

const naruto = CONTENT_PACKS.find((p) => p.id === 'naruto');
const describeFan = naruto ? describe : describe.skip;

describeFan('the Leaf’s senior jobs', () => {
  const ctx = createGameContext(naruto!);
  const senior = ctx.content.missions.all.filter((m) => m.id.startsWith('senior-'));
  const ranked = (rank: GameState['standing']['rank']): GameState => {
    const state = veteran(newGame({}, ctx), 40);
    return { ...state, standing: { ...state.standing, rank } };
  };

  it('has B-, A- and S-rank work, all of it posted at the mission desk', () => {
    const count = (rank: string) => senior.filter((m) => m.rank === rank).length;
    expect(count('B')).toBeGreaterThanOrEqual(10);
    expect(count('A')).toBeGreaterThanOrEqual(5);
    expect(count('S')).toBeGreaterThanOrEqual(3);
    const desk = ctx.content.locations
      .require('konohagakure')
      .places.find((p) => p.kind === 'missions');
    const listed = desk?.kind === 'missions' ? desk.missionIds : [];
    for (const job of senior) expect(listed).toContain(job.id);
  });

  it('sends B-rank work to chūnin, and S-rank only to jōnin', () => {
    for (const job of senior) {
      const lowest = lowestRankFor(jobOf(ctx, job));
      if (job.rank === 'B') expect(lowest).toBe('chunin');
      if (job.rank === 'A') expect(['chunin', 'jonin']).toContain(lowest);
      if (job.rank === 'S') expect(lowest).toBe('jonin');
    }
  });

  it('puts senior work on a chūnin’s board and none on a genin’s', () => {
    const notices = (state: GameState) =>
      missionBoardView(state, ctx)?.notices.map((n) => n.id) ?? [];
    const seniorIds = senior.map((m) => m.id);
    expect(notices(ranked('chunin')).some((id) => seniorIds.includes(id))).toBe(true);
    expect(notices(veteran(newGame({}, ctx), 40)).some((id) => seniorIds.includes(id))).toBe(false);
  });

  it('walks a senior job out along the map’s roads and back', () => {
    const jonin = ranked('jonin');
    const going = act(jonin, { type: 'startMission', missionId: 'senior-stone-surveyors' }, ctx);
    const kinds = activeMission(going, ctx)?.stages.map((s) => s.kind) ?? [];
    expect(kinds).toContain('leg');
    expect(kinds).toContain('encounter');
    expect(kinds.at(-1)).toBe('leg');
  });
});
