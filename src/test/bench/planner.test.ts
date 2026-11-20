import { CAST_IDS, type CastId } from './matrixCast';
import { bout } from './planner';

/**
 * Foes who think ahead (`engines/plan/mind/planner/`): a planning foe plays the same fight the
 * same way every time (two fights, cheap enough for the pipeline), and over the cast does at least
 * as well as today's foe (run locally).
 * Set `VITE_BENCH_REPORT=true` for the whole cast, foe by foe.
 */

const PAIRS: readonly (readonly [CastId, CastId])[] = [
  ['rusher', 'assassin'],
  ['illusionist', 'gates'],
  ['medic', 'stalker'],
  ['sealer', 'cloner'],
];

describe('foes who think ahead', () => {
  it('fight the same fight the same way', () => {
    const [a, b] = PAIRS[0]!;
    const once = bout(a, b, { seed: 3, planner: true });
    const again = bout(a, b, { seed: 3, planner: true });
    expect({ ...again, ms: 0 }).toEqual({ ...once, ms: 0 });
  });

  it.runIf(import.meta.env.VITE_BENCH_REPORT === 'true')(
    'against today’s foes over the whole cast',
    () => {
      const seeds = Number(import.meta.env.VITE_PLANNER_SEEDS ?? 2);
      const rows: string[] = [];
      let today = { won: 0, margin: 0, ms: 0, n: 0 };
      let thinking = { won: 0, margin: 0, ms: 0, n: 0 };
      for (const b of CAST_IDS) {
        let t = { won: 0, margin: 0 };
        let p = { won: 0, margin: 0 };
        for (const a of CAST_IDS) {
          for (let seed = 1; seed <= seeds; seed++) {
            const x = bout(a, b, { seed, planner: false });
            const y = bout(a, b, { seed, planner: true });
            t = { won: t.won + (x.foeWon ? 1 : 0), margin: t.margin + x.margin };
            p = { won: p.won + (y.foeWon ? 1 : 0), margin: p.margin + y.margin };
            today = {
              won: today.won + (x.foeWon ? 1 : 0),
              margin: today.margin + x.margin,
              ms: today.ms + x.ms,
              n: today.n + 1,
            };
            thinking = {
              won: thinking.won + (y.foeWon ? 1 : 0),
              margin: thinking.margin + y.margin,
              ms: thinking.ms + y.ms,
              n: thinking.n + 1,
            };
          }
        }
        const n = CAST_IDS.length * seeds;
        rows.push(
          `| ${b} | ${((100 * t.won) / n).toFixed(0)}% | ${((100 * p.won) / n).toFixed(0)}% | ${(t.margin / n).toFixed(2)} | ${(p.margin / n).toFixed(2)} |`,
        );
      }
      const pct = (x: { won: number; n: number }) => `${((100 * x.won) / x.n).toFixed(1)}%`;
      console.warn(
        `${today.n} fights each. Foe wins: today ${pct(today)}, thinking ${pct(thinking)}. Margin: ${(today.margin / today.n).toFixed(3)} against ${(thinking.margin / thinking.n).toFixed(3)}. Time a fight: ${(today.ms / today.n).toFixed(0)} ms against ${(thinking.ms / thinking.n).toFixed(0)} ms.`,
      );
      console.warn(
        [
          '| Foe | Wins, today | Wins, thinking | Margin, today | Margin, thinking |',
          '| --- | --- | --- | --- | --- |',
          ...rows,
        ].join('\n'),
      );
    },
    3_600_000,
  );
});
