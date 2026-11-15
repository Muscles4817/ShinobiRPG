import { CAST_IDS, type CastId } from '../../src/test/bench/matrixCast';
import { bout } from '../../src/test/bench/planner';

/**
 * Are the three regressions real, or the chance of 44 fights each? The same foes, against the
 * whole cast, over many more seeds, with a clear gain (the assassin) as the control.
 */

const FOES: readonly CastId[] = ['foresight', 'mimic', 'mistBlade', 'counterer', 'assassin'];
const SEEDS = 8;

it('many seeds', () => {
  for (const b of FOES) {
    let today = 0;
    let thinking = 0;
    let n = 0;
    for (const a of CAST_IDS) {
      for (let seed = 101; seed < 101 + SEEDS; seed++) {
        today += bout(a, b, { seed, planner: false }).foeWon ? 1 : 0;
        thinking += bout(a, b, { seed, planner: true }).foeWon ? 1 : 0;
        n += 1;
      }
    }
    const se = Math.sqrt((0.25 * 2) / n);
    console.warn(
      `${b}: ${n} fights. Today ${((100 * today) / n).toFixed(1)}%, thinking ${((100 * thinking) / n).toFixed(1)}% (one standard error of the difference about ${(100 * se).toFixed(1)} points)`,
    );
  }
});
