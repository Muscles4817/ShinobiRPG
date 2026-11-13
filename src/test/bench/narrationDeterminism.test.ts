import { vi } from 'vitest';

import type * as Telling from '@/systems/combat/rules/telling';

import { CAST_IDS, castMember, type CastId } from './matrixCast';
import { skirmishOnce, type FightRecord } from './runner';

/**
 * A fight comes out the same whatever its story says. The same seeded fights are played twice,
 * once with every line told as written and once with every line told empty, and must end alike.
 * An attack lost in a field once counted as lost only if its line had words in it (`round.ts`),
 * so a blank line let the attack land.
 */

const narration = vi.hoisted(() => ({ blank: false }));

vi.mock('@/systems/combat/rules/telling', async (original) => {
  const real = await original<typeof Telling>();
  return {
    ...real,
    tell: (...args: Parameters<typeof real.tell>) => (narration.blank ? '' : real.tell(...args)),
  };
});

/** Pairs whose fights raise fields and hide: where story lines have stood in for outcomes. */
const PAIRS: readonly (readonly [CastId, CastId])[] = [
  ['stalker', 'mistBlade'],
  ['mistBlade', 'stalker'],
  ['illusionist', 'mistBlade'],
  ['assassin', 'shrouded'],
];
const SEEDS = 12;

function fight(a: CastId, b: CastId, seed: number, blank: boolean): FightRecord {
  narration.blank = blank;
  try {
    const foes = [castMember(b, 'chunin')];
    return skirmishOnce({ player: castMember(a, 'chunin'), allies: [], foes, watch: true }, seed);
  } finally {
    narration.blank = false;
  }
}

describe('narration never decides a fight', () => {
  it('knows the pairs it plays', () => {
    expect(PAIRS.flat().every((id) => CAST_IDS.includes(id))).toBe(true);
  });

  it.each(PAIRS)('%s against %s ends the same with every line told empty', (a, b) => {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const told = fight(a, b, seed, false);
      const blank = fight(a, b, seed, true);
      // What the fight did, not what was said: used techniques are ids, not words.
      expect({ ...blank, seed }).toEqual({ ...told, seed });
    }
  });
});
