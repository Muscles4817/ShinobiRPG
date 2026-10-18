import { CONTENT_PACKS } from '@/content';
import { arcPlayer } from '@/test/arcPlay';
import { act, ctx, formTeam, freshGame, veteran } from '@/test/gameFixtures';

import { boardFor } from './board';
import { createGameContext } from './context';
import { failMission } from './missionFlow';
import type { GameState } from './state';

/**
 * What a job leaves behind lasts only if the job is done, and a follow-up told once is never
 * posted again: so a job failed and retaken, or done twice, can't count anything twice.
 */

const naruto = createGameContext(CONTENT_PACKS.find((p) => p.id === 'naruto')!);

describe('what a job leaves behind', () => {
  const { ready, play, upTo } = arcPlayer(naruto);
  const leave = 'Leave the road and go after them';

  it('is held until the job is done, and dropped when it fails', () => {
    const interviewed = play(ready(), 'arc-ibiki-interview');
    const atTheRoad = upTo(interviewed, 'arc-ibiki-sealed-message', 'Leave the road');
    const left = act(atTheRoad, { type: 'missionDecide', optionIndex: 0 }, naruto);
    expect(left.village.marks).not.toContain('ibiki-left-road');
    expect(left.mission?.held).toContainEqual({ kind: 'world', mark: 'ibiki-left-road' });

    const failed = failMission(left, naruto, 'Called back to the village.');
    expect(failed.village.marks).not.toContain('ibiki-left-road');
    expect(play(interviewed, 'arc-ibiki-sealed-message', [leave]).village.marks).toContain(
      'ibiki-left-road',
    );
  });
});

describe('a follow-up told once', () => {
  function onDays(start: GameState): string[] {
    return Array.from({ length: 150 }, (_, d) =>
      boardFor({ ...start, time: { day: d + 1, slot: 0 } }, ctx).postings.map((p) => p.missionId),
    ).flat();
  }
  const hushed = (marks: string[], completed: string[] = []): GameState => {
    const s = veteran(formTeam(freshGame()), 6);
    return {
      ...s,
      village: { ...s.village, marks },
      board: { ...s.board, completed },
    };
  };

  it('goes up while its story waits on it', () => {
    expect(onDays(hushed(['brewer-hushed']))).toContain('brewer-second-well');
  });

  it('never goes up again once done, or once the story has moved past it', () => {
    expect(onDays(hushed(['brewer-hushed'], ['brewer-second-well']))).not.toContain(
      'brewer-second-well',
    );
    expect(onDays(hushed(['brewer-hushed', 'brewer-exposed']))).not.toContain('brewer-second-well');
  });
});
