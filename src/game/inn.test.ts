import { CONTENT_PACKS, validateContent, type ContentPack, type PersonDef } from '@/content';
import { act, newGame } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { dispatch } from './dispatch';
import { INN_HEALTH_SHARE } from './actions/inn';
import { peopleHere, villagers } from './people/cast';

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const ROOM = 25;

/** Hotaru, retired to the coast: she keeps the inn's desk all day. */
const { teacher: _teaches, ...hotaru } = original.people.find((p) => p.id === 'hotaru')!;
const innkeeper: PersonDef = {
  ...hotaru,
  homeLocationId: 'port-shiomachi',
  schedule: { morning: 'gulls-rest', afternoon: 'gulls-rest', evening: 'gulls-rest', night: null },
};

/** The original pack with the port opened, an inn there, and Hotaru living at it. */
const coast: ContentPack = {
  ...original,
  locations: original.locations.map((l) => {
    if (l.id !== 'port-shiomachi') return l;
    const { lockedReason: _opened, ...open } = l;
    return {
      ...open,
      places: [
        {
          id: 'gulls-rest',
          kind: 'inn' as const,
          name: 'The Gull’s Rest',
          icon: 'house' as const,
          blurb: 'Salt on the windows, clean straw mats.',
          keeper: 'Old Isa, at the desk',
          roomCost: ROOM,
        },
      ],
    };
  }),
  people: original.people.map((p) => (p.id === 'hotaru' ? innkeeper : p)),
};
const ctx = createGameContext(coast);

function atThePort() {
  const start = newGame({}, ctx);
  const going = act(start, { type: 'travel', locationId: 'port-shiomachi', quick: true }, ctx);
  // A road event may stop you; take its first way past.
  const there = going.mission ? act(going, { type: 'missionDecide', optionIndex: 0 }, ctx) : going;
  expect(there.locationId).toBe('port-shiomachi');
  return there;
}

describe('the inn', () => {
  it('is valid content', () => {
    expect(validateContent(coast)).toEqual([]);
  });

  it('sells a night: the room is paid for, and you wake at dawn', () => {
    const tired = atThePort();
    const worn = {
      ...tired,
      character: {
        ...tired.character,
        vitals: { ...tired.character.vitals, energy: 10, health: 40 },
      },
    };
    const slept = act(worn, { type: 'takeRoom' }, ctx);
    expect(slept.wallet.ryo).toBe(worn.wallet.ryo - ROOM);
    expect(slept.time.day).toBe(worn.time.day + 1);
    expect(slept.time.slot).toBe(0);
    expect(slept.character.vitals.energy).toBeGreaterThan(worn.character.vitals.energy);

    // Nearly as good as your own bed.
    const atHome = act({ ...worn, locationId: 'torogakure' }, { type: 'sleep' }, ctx);
    const healed = (s: typeof slept) => s.character.vitals.health - 40;
    expect(healed(slept)).toBe(Math.round(healed(atHome) * INN_HEALTH_SHARE));
  });

  it('is only where there is one, and needs the price', () => {
    expect(dispatch(newGame({}, ctx), { type: 'takeRoom' }, ctx)).toEqual({
      ok: false,
      error: 'There is no inn here.',
    });
    const broke = { ...atThePort(), wallet: { ryo: ROOM - 1 } };
    expect(dispatch(broke, { type: 'takeRoom' }, ctx)).toEqual({
      ok: false,
      error: `A room costs ${ROOM} ryo.`,
    });
  });
});

describe('people who live elsewhere', () => {
  it('are met in their own town, not at home', () => {
    const home = newGame({}, ctx);
    expect(peopleHere(home, ctx).some((p) => p.person.id === 'hotaru')).toBe(false);
    expect(peopleHere(atThePort(), ctx).find((p) => p.person.id === 'hotaru')?.placeId).toBe(
      'gulls-rest',
    );
  });

  it('are not the village’s to send on jobs or teams', () => {
    expect(villagers(newGame({}, ctx), ctx).some((p) => p.id === 'hotaru')).toBe(false);
  });

  it('must live somewhere real, by a role that may live away', () => {
    const genin = original.people.find((p) => p.role === 'genin')!;
    const pack: ContentPack = {
      ...coast,
      people: [
        ...coast.people.filter((p) => p.id !== genin.id),
        { ...genin, homeLocationId: 'port-shiomachi' },
        { ...innkeeper, id: 'lost', name: 'Lost', homeLocationId: 'atlantis' },
      ],
    };
    const problems = validateContent(pack);
    expect(problems).toContain(`person "${genin.id}" is a genin, so lives in the start village`);
    expect(problems).toContain('person "lost" lives in unknown location "atlantis"');
  });
});
