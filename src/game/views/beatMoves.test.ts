import { healthMoves } from './beatMoves';
import type { FightBeat } from './fightReplay';

/** A beat's health moves, read from the beats themselves. */

function beat(health: Readonly<Record<string, number>>): FightBeat {
  return {
    kind: 'line',
    text: 'Something happens.',
    chips: [],
    actorId: null,
    targetId: null,
    range: 'mid',
    force: null,
    health,
    pools: {},
    statuses: {},
    present: [],
  };
}

const BEATS = [
  beat({ you: 100, foe: 100 }),
  beat({ you: 100, foe: 80 }),
  beat({ you: 90, foe: 85, clone: 100 }),
];

describe('whose health a beat moved', () => {
  it('reads each beat against the one before it', () => {
    expect(healthMoves(BEATS, 1)).toEqual({ foe: 'hurt' });
    expect(healthMoves(BEATS, 2)).toEqual({ you: 'hurt', foe: 'healed' });
  });

  it('says nothing for the first beat, or one past the end', () => {
    expect(healthMoves(BEATS, 0)).toEqual({});
    expect(healthMoves(BEATS, 3)).toEqual({});
  });
});
