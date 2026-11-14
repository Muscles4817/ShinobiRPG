import { APPROACHES } from './approaches';
import { closedLoop, saveClosed, type ClosedRow } from './closed';

/**
 * Closed-loop fights for chosen approaches: `CLOSED=<tag>:<name>|<name>…` (names as in
 * `approaches.ts`; `default` for the default plan). Results in `out/closed-<tag>.json`.
 */
it('fights closed loop', () => {
  const spec = process.env.CLOSED ?? 'default:default';
  const tag = spec.slice(0, spec.indexOf(':'));
  const list = spec.slice(spec.indexOf(':') + 1);
  const rows: ClosedRow[] = [];
  for (const name of list.split('|')) {
    const approach = name === 'default' ? null : APPROACHES.find((a) => a.name === name);
    if (approach === undefined) throw new Error(`no approach ${name}`);
    for (const row of closedLoop(approach)) {
      console.log(JSON.stringify(row));
      rows.push(row);
    }
  }
  saveClosed(tag, rows);
});
