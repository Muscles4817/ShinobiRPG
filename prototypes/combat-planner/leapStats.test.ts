import { vi } from 'vitest';

import { CAST_IDS, castMember } from '@/test/bench/matrixCast';
import { skirmishOnce } from '@/test/bench/runner';

/**
 * Experiment 1: how often a Dodge leaps clear across the archetype matrix (watched fights at
 * chūnin, 6 seeds a pair). Counts each leap that moved a pair, by the dodger's build.
 */
const counted = vi.hoisted(() => ({ n: 0 }));
vi.mock('@/systems/combat/engines/plan/leap', async (original) => {
  const real = await original<typeof import('@/systems/combat/engines/plan/leap')>();
  return {
    ...real,
    leapClear: (...args: Parameters<typeof real.leapClear>) => {
      const after = real.leapClear(...args);
      if (after !== args[0]) counted.n++;
      return after;
    },
  };
});

it('counts leaps across the matrix', () => {
  let fights = 0;
  let withLeap = 0;
  let leaps = 0;
  const byBuild = new Map<string, number>();
  for (const a of CAST_IDS) {
    for (const b of CAST_IDS) {
      if (a === b) continue;
      for (let seed = 1; seed <= 6; seed++) {
        counted.n = 0;
        skirmishOnce(
          {
            player: castMember(a, 'chunin'),
            allies: [],
            foes: [castMember(b, 'chunin')],
            watch: true,
          },
          seed,
        );
        fights++;
        leaps += counted.n;
        if (counted.n) withLeap++;
        byBuild.set(`${a} v ${b}`, (byBuild.get(`${a} v ${b}`) ?? 0) + counted.n);
      }
    }
  }
  const top = [...byBuild].sort((x, y) => y[1] - x[1]).slice(0, 10);
  console.log(
    `LEAPSTATS fights ${fights}, with a leap ${((100 * withLeap) / fights).toFixed(0)}%, leaps a fight ${(leaps / fights).toFixed(2)}; most (pair: leaps in 6 fights) ${JSON.stringify(top)}`,
  );
});
