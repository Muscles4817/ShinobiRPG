import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

import type { ClosedRow } from './closed';
import { loadRows, NEAR, referenceNoise } from './compare';
import { loadReferences } from './reference';

/** Turns `out/*.json` into the markdown tables of `RESULTS.md` (`out/tables.md`). */
it('writes the tables', () => {
  const refs = loadReferences();
  const noise = referenceNoise(refs);
  const rows = loadRows();
  const f = (x: number, d = 0) => x.toFixed(d);
  const lines = [
    `Reference: ${refs.length} states, mean ${f(refs.reduce((t, r) => t + r.exchanges, 0) / refs.length)} exchanges and ${f(refs.reduce((t, r) => t + r.ms, 0) / refs.length / 1000, 1)} s each.`,
    `Reference noise (32 seeds against the other 32): agreement ${f(100 * noise.agreement)}%, within ${NEAR} of best ${f(100 * noise.nearBest)}%, regret mean ${f(noise.regretMean, 1)}, worst ${f(noise.regretWorst, 1)}.`,
    '',
    '| Approach | Category | ms median | ms p95 | exchanges | model evals | agree | near best | regret mean | regret worst | daze@0 plays | hide@0 plays | notes |',
    '| --- | --- | --: | --: | --: | --: | --: | --: | --: | --: | --- | --- | --- |',
    ...rows.map(
      (r) =>
        `| ${r.name} | ${r.category} | ${f(r.msMedian)} | ${f(r.msP95)} | ${f(r.exchangesMean)} | ${f(r.evalsMean)} | ${f(100 * r.agreement)}% | ${f(100 * (r.nearBest ?? NaN))}% | ${f(r.regretMean, 1)} | ${f(r.regretWorst, 1)} (${r.worstAt}) | ${r.daze} | ${r.hide} | ${[r.stats, r.notes ? JSON.stringify(r.notes) : ''].filter(Boolean).join('; ')} |`,
    ),
    '',
  ];
  const out = new URL('./out/', import.meta.url);
  const closed = readdirSync(out)
    .filter((n) => n.startsWith('closed-'))
    .flatMap((n) => JSON.parse(readFileSync(new URL(n, out), 'utf8')) as ClosedRow[]);
  if (closed.length) {
    lines.push(
      '| Approach | Scenario | won | dealt | taken | ms / decision | usual openings | notes |',
      '| --- | --- | --: | --: | --: | --: | --- | --- |',
      ...closed.map(
        (c) =>
          `| ${c.approach} | ${c.scenario} | ${c.won}/${c.fights} | ${f(c.dealt)} | ${f(c.taken)} | ${f(c.msPerDecision)} | ${c.openings} | ${c.stats ?? ''} |`,
      ),
    );
  }
  const timingFile = new URL('./out/timing.json', import.meta.url);
  if (existsSync(timingFile)) {
    const timing = JSON.parse(readFileSync(timingFile, 'utf8')) as {
      name: string;
      silent?: boolean;
      median: number;
      p95: number;
      exchanges?: number;
      usPerExchange?: number;
    }[];
    lines.push(
      '',
      '| Approach (uncontended) | silent | ms median | ms p95 | exchanges | µs / exchange |',
      '| --- | --- | --: | --: | --: | --: |',
      ...timing.map(
        (t) =>
          `| ${t.name} | ${t.silent === undefined ? '' : t.silent ? 'yes' : 'no'} | ${f(t.median, 1)} | ${f(t.p95, 1)} | ${f(t.exchanges ?? 0)} | ${f(t.usPerExchange ?? 0)} |`,
      ),
    );
  }
  writeFileSync(new URL('./out/tables.md', import.meta.url), lines.join('\n'));
  console.log(lines.join('\n'));
});
