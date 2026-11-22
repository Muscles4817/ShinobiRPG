import { bondWith } from '@/systems/bonds';
import { act, newGame } from '@/test/gameFixtures';

import { deserialize } from './save';

describe('the facts migration', () => {
  it('numbers the injuries carried, remembers who gave, and keeps no facts yet', () => {
    const game = newGame();
    const [friend, acquaintance] = game.people.team!.teammateIds;
    const { woundsTaken: _w, ...character } = game.character;
    const { givers: _g, ...housing } = game.housing;
    const { upcoming: _u, ...board } = game.board;
    const { facts: _f, ...rest } = game;
    const { factsFrom: _from, ...start } = game.daybook.start!;
    const older = {
      ...rest,
      housing,
      board,
      character: {
        ...character,
        injuries: [
          { injuryId: 'cracked-ribs', until: 5 },
          { injuryId: 'sprained-wrist', until: 3 },
        ],
      },
      people: {
        ...game.people,
        bonds: { [friend!]: bondWith(60), [acquaintance!]: bondWith(20) },
      },
      daybook: {
        start: { ...start, missionsCompleted: 0, injuries: ['cracked-ribs@5'] },
        ended: { day: 1, jobs: ['Lantern patrol'], injuries: ['cracked-ribs'] },
      },
    };
    const loaded = deserialize(JSON.stringify({ version: 74, state: older }));
    if (!loaded.ok) throw new Error(loaded.error);
    const state = loaded.value;
    expect(state.character.injuries.map((i) => i.instance)).toEqual([1, 2]);
    expect(state.character.woundsTaken).toBe(2);
    expect(state.housing.givers).toEqual([friend]);
    expect(state.board.upcoming).toBeNull();
    expect(state.facts).toEqual([]);
    expect(state.daybook.start?.factsFrom).toBe(0);
    expect(state.daybook.start).not.toHaveProperty('injuries');
    expect(state.daybook.ended).toBeNull();
  });

  it('keeps the lines a job under way has written reading as they did, and graded as they were', () => {
    const veteranRun = act(newGame({ standing: { ...newGame().standing, missionsCompleted: 5 } }), {
      type: 'startMission',
      missionId: 'tea-merchant-escort',
    });
    const run = veteranRun.mission!;
    const { facts: _f, ...rest } = veteranRun;
    const older = {
      ...rest,
      mission: {
        ...run,
        ledger: [
          { stageIndex: 0, text: 'Took a goat track over the hill.', tone: 'cost' },
          { stageIndex: 0, text: 'The client asked for you by name.', tone: 'gain' },
        ],
      },
    };
    const loaded = deserialize(JSON.stringify({ version: 74, state: older }));
    if (!loaded.ok) throw new Error(loaded.error);
    const [mine, theirs] = loaded.value.mission!.ledger;
    expect(mine).toMatchObject({ setback: true });
    expect(mine).not.toHaveProperty('subject');
    expect(theirs).toMatchObject({ subject: 'its-own' });
    expect(theirs).not.toHaveProperty('setback');
  });
});
