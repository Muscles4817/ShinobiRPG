import { writeFileSync } from 'node:fs';

import { APPROACHES } from '../approaches';
import { Sim, simFlags } from '../sim';
import { decisionStates } from '../states';

/**
 * Uncontended timings (run alone): the chosen approaches over every decision state, loud and
 * silent (outcomes identical, `silent.test.ts`), plus the fixed cost of a decision before any
 * exchange (building the candidate list: the kit's cards and the engine's check of each).
 * `TIMED=<name>|<name>…`. Results in `out/timing.json`.
 */

const setSilent = (on: boolean) => ((globalThis as { __SILENT__?: boolean }).__SILENT__ = on);
const quantile = (xs: number[], q: number) =>
  [...xs].sort((a, b) => a - b)[Math.floor(q * xs.length)]!;

it('times the chosen approaches loud and silent', () => {
  const states = decisionStates();
  const names = (process.env.TIMED ?? 'E1 prefix sharing (d2 w4 r16)').split('|');
  // Warm up.
  for (const d of states.slice(0, 6)) APPROACHES[1]!.make().planner(d.state, d.selfId);
  const fixed: number[] = [];
  for (const d of states) {
    const began = performance.now();
    for (let i = 0; i < 20; i++)
      new Sim(d.state, d.selfId, { share: true, seedBase: 1, ownHurt: 1 });
    fixed.push((performance.now() - began) / 20);
  }
  const out: Record<string, unknown>[] = [
    {
      name: 'fixed cost (candidate list)',
      median: quantile(fixed, 0.5),
      p95: quantile(fixed, 0.95),
    },
  ];
  for (const name of names) {
    const a = APPROACHES.find((x) => x.name === name);
    if (!a) throw new Error(`no approach ${name}`);
    for (const silent of [false, true]) {
      setSilent(silent);
      simFlags.lean = silent;
      const { planner } = a.make();
      const ms: number[] = [];
      let ex = 0;
      for (const d of states) {
        const r = planner(d.state, d.selfId);
        ms.push(r.ms);
        ex += r.exchanges;
      }
      setSilent(false);
      simFlags.lean = false;
      const row = {
        name,
        silent,
        median: quantile(ms, 0.5),
        p95: quantile(ms, 0.95),
        mean: ms.reduce((t, x) => t + x, 0) / ms.length,
        exchanges: ex / states.length,
        usPerExchange: ex ? (1000 * ms.reduce((t, x) => t + x, 0)) / ex : 0,
      };
      console.log(JSON.stringify(row));
      out.push(row);
    }
  }
  writeFileSync(new URL('../out/timing.json', import.meta.url), JSON.stringify(out, null, 1));
});
