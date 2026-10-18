import { contextForPack } from '../context';
import { newGame } from '@/test/gameFixtures';
import { personSheet } from './personSheet';

/** Someone's profile grows as you get to know them, and says only what the game does. */

const ctx = contextForPack('original')!;

function withBond(personId: string, points: number) {
  const state = newGame();
  return {
    ...state,
    people: {
      ...state.people,
      bonds: { ...state.people.bonds, [personId]: { points, lastTalkDay: null, heard: [] } },
    },
  };
}

describe('person profiles', () => {
  it('keep a stranger short: no day, no arts, but what knowing them opens next', () => {
    const sheet = personSheet(newGame(), ctx, 'tetsu')!;
    expect(sheet.path.name).toBe('Stranger');
    expect(sheet.path.next?.opens).toContain('You learn what he’s like.');
    expect(sheet.day).toBeNull();
    expect(sheet.arts).toBeNull();
    expect(sheet.traits).toBeNull();
  });

  it('show an acquaintance’s day, with the time it is now marked', () => {
    const sheet = personSheet(withBond('tetsu', 12), ctx, 'tetsu')!;
    expect(sheet.day).toHaveLength(4);
    expect(sheet.day?.filter((d) => d.now)).toHaveLength(1);
    expect(sheet.likes).toBeNull();
  });

  it('show your sensei in full from the start, with what their trust signs', () => {
    const state = newGame();
    const senseiId = state.people.team!.senseiId!;
    const sheet = personSheet(state, ctx, senseiId)!;
    expect(sheet.relation).toBe('sensei');
    expect(sheet.day).not.toBeNull();
    const opens = sheet.path.next?.opens ?? [];
    expect(opens.length).toBeGreaterThan(0);
    expect(sheet.sizing?.label).toBeTruthy();
  });

  it('tell a genin teammate’s growth since the academy', () => {
    const state = newGame();
    const mate = state.people.team!.teammateIds[0]!;
    expect(personSheet(state, ctx, mate)?.growth).toEqual([]);
  });

  it('split a canon arsenal into what they can do now and what they are growing into', () => {
    const naruto = contextForPack('naruto')!;
    const state = newGame({}, naruto);
    const friend = {
      ...state,
      people: {
        ...state.people,
        bonds: { naruto: { points: 12, lastTalkDay: null, heard: [] } },
      },
    };
    const arts = personSheet(friend, naruto, 'naruto')?.arts;
    expect(arts?.doable.length).toBeGreaterThan(0);
    expect(arts?.growing.length).toBeLessThanOrEqual(6);
    expect(arts?.moreGrowing).toBeGreaterThan(0);
    // The nearest first, each saying what it waits on.
    expect(arts?.growing[0]?.when).toMatch(/^When (his|her|their) /);
  });
});
