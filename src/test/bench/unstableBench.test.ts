import { plainAtGrade } from './archetypes';
import { techniques, type FighterSpec } from './fighters';
import { bench, summarise, type BenchReport } from './runner';

/**
 * Unstable techniques on the bench (step 4.1): a technique learned a rank above its user costs
 * more chakra and sometimes misfires, so it is worth less in the same hands than a steady one,
 * but it is still a technique. `VITE_BENCH_REPORT=true` prints the measurements.
 */

const REPORT = import.meta.env.VITE_BENCH_REPORT === 'true';
/** Enough fights that the misfire's toll shows through the seeds' noise. */
const SEEDS = 120;

function head(player: FighterSpec, opponent: FighterSpec): BenchReport {
  const report = bench(player, opponent, SEEDS);
  if (REPORT) console.warn(summarise(player, opponent, report));
  return report;
}

function knowing(fighter: FighterSpec, id: string, unstable: boolean): FighterSpec {
  const [technique] = techniques([id]);
  if (!technique) throw new Error(`no technique ${id}`);
  return {
    ...fighter,
    name: `${fighter.name} with ${unstable ? 'an unstable' : 'a steady'} ${id}`,
    techniques: [...fighter.techniques, unstable ? { ...technique, unstable: true } : technique],
  };
}

describe('unstable techniques (step 4.1)', () => {
  it.each(['ember-breath', 'kindled-pulse'])(
    'an unstable %s wins less often than a steady one against an equal',
    (id) => {
      const plain = plainAtGrade('D');
      const steady = head(knowing(plain, id, false), plain);
      const shaky = head(knowing(plain, id, true), plain);
      expect(shaky.winRate).toBeLessThan(steady.winRate);
      expect(shaky.stalemateRate).toBe(0);
    },
  );
});
