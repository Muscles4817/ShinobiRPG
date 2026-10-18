import type { MissionDef } from '@/systems/missions';
import { newGame, ctx } from '@/test/gameFixtures';

import { awayFor } from './awayNotes';
import { keeperSlots } from './companions/keeper';
import { teammateBlocker } from './exam/entry';
import { teamAllies } from './missionTeam';
import { findPerson } from './people/cast';
import { placeInText } from './placeName';
import { fillSlots } from '@/core';
import type { GameState } from './state';
import { bondPath } from './views/bondPath';
import { crewWords } from './views/crewWords';

/** Lines about one person agree with their pronouns; counts and lists read as English. */

const person = (state: GameState, id: string) => {
  const found = findPerson(state, ctx, id);
  if (!found) throw new Error(`no ${id}`);
  return found;
};

function withLeader(leaderId: string): GameState {
  const state = newGame();
  const crew = { kind: 'chunin-squad' as const, leaderId, memberIds: [] };
  // Only the crew is read for the allies; the rest of a run doesn't matter here.
  return { ...state, mission: { crew } as unknown as GameState['mission'] };
}

describe('lines about a person', () => {
  it('a teammate who isn’t ready is “she” when she is a she', () => {
    const state = newGame();
    expect(teammateBlocker(state, person(state, 'shiori'))).toMatch(
      /^Shiori isn’t ready: she needs /,
    );
  });

  it('a stranger’s sheet promises to show what he’s like', () => {
    const state = newGame();
    expect(bondPath(state, person(state, 'tetsu')).next?.opens).toContain(
      'You learn what he’s like.',
    );
  });

  it('a leader who isn’t your sensei won’t take orders, in their own pronouns', () => {
    const leader = teamAllies(withLeader('shiori'), ctx).at(-1);
    expect(leader?.orders?.stanceLocked).toBe(
      'Shiori leads this mission. She doesn’t take orders from you.',
    );
    expect(leader?.orders?.cardsLocked).toBe('She fights her own way.');
  });

  it('an unknown vet is “the vet”, capitalised only to open a line', () => {
    const slots = keeperSlots(newGame(), ctx, 'nobody-at-all');
    expect(fillSlots('{vet} has done all {vet.they} can.', slots)).toBe(
      'The vet has done all they can.',
    );
    expect(fillSlots('Ask {vet} about it.', slots)).toBe('Ask the vet about it.');
  });
});

describe('counts, lists and places', () => {
  // Only the legs are read for days away; the rest of a job doesn't matter here.
  const legs = (days: number): MissionDef =>
    ({ stages: [{ kind: 'leg', days, text: 'The road.' }] }) as unknown as MissionDef;

  it('a one-day job is “a day away”, a longer one in words', () => {
    expect(awayFor(legs(1))).toBe('A day away');
    expect(awayFor(legs(3))).toBe('Three days away');
  });

  it('a crew of three reads as a list', () => {
    const state = newGame();
    const crew = {
      kind: 'genin-squad' as const,
      leaderId: null,
      memberIds: ['kaen', 'jin', 'nao'],
    };
    expect(crewWords(state, ctx, crew)?.line).toBe('You lead Kaen, Jin and Nao');
  });

  it('a titled place drops its capital mid-sentence', () => {
    expect(placeInText('The Lantern Archive')).toBe('the Lantern Archive');
    expect(placeInText('Market Street')).toBe('Market Street');
  });
});
