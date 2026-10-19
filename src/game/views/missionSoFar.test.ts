import { act, ctx, newGame, veteran } from '@/test/gameFixtures';

import { missionSoFar } from './missionSoFar';

describe('a job so far', () => {
  const started = act(veteran(newGame(), 5), {
    type: 'startMission',
    missionId: 'tea-merchant-escort',
  });

  it('is nothing when no job is under way', () => {
    expect(missionSoFar(newGame(), ctx)).toBeNull();
  });

  it('names everyone along, with nothing gained yet and an empty road', () => {
    const soFar = missionSoFar(started, ctx)!;
    expect(soFar.road).toEqual([]);
    expect(soFar.crew.length).toBe(started.mission!.crew.memberIds.length);
    expect(soFar.crew.every((c) => c.bond === 0)).toBe(true);
  });

  it('reads the ledger and the bond gained as the debrief will', () => {
    const [firstId] = started.mission!.crew.memberIds;
    const bond = started.people.bonds[firstId!];
    const along = {
      ...started,
      people: {
        ...started.people,
        bonds: { ...started.people.bonds, [firstId!]: { ...bond!, points: bond!.points + 3 } },
      },
      mission: {
        ...started.mission!,
        ledger: [{ stageIndex: 0, text: 'Found a ford.', tone: 'gain' as const }],
      },
    };
    const soFar = missionSoFar(along, ctx)!;
    expect(soFar.road.map((l) => l.text).join('')).toMatch(/found a ford/i);
    expect(soFar.crew[0]!.bond).toBe(3);
  });
});
