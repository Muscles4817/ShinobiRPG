import { PAIRS, benchDuel, daze, hide } from '../perf/states';
import { auditor } from './audit';
import { runCell, line, type CellRow } from './cell';
import { cast, save } from './fixtures';
import type { Controller } from './loop';
import { PERF_GOAP } from './mind';

/**
 * Q2 and Q5: reusing plans. Warm starts (re-score the tail and last time's top alternatives, no
 * fresh candidate set) between exchanges and between rounds, and skipping a re-plan when the
 * situation key is unchanged. Same search as Q1 (GOAP r8). `AUDIT=1` audits every warm choice and
 * kept step against a fresh plan (untimed).
 */

const P = PERF_GOAP;
const audit = process.env.AUDIT === '1';

const POLICIES: readonly { name: string; c: (id: string, seed: number) => Controller }[] = [
  {
    name: 'every exchange, warm within the round',
    c: (id, seed) => ({
      id,
      policy: 'exchange',
      params: P,
      warm: true,
      ...(audit ? { audit: auditor(P, seed) } : {}),
    }),
  },
  {
    name: 'every exchange, skip if unchanged',
    c: (id) => ({ id, policy: 'exchange', params: P, skipSame: true }),
  },
  {
    name: 'round, warm between rounds (full every 2nd)',
    c: (id, seed) => ({
      id,
      policy: 'round',
      params: P,
      onInvalid: 'replan',
      warm: true,
      fullEvery: 2,
      ...(audit ? { audit: auditor(P, seed) } : {}),
    }),
  },
  {
    name: 'round, warm between rounds (never full unless triggered)',
    c: (id, seed) => ({
      id,
      policy: 'round',
      params: P,
      onInvalid: 'replan',
      warm: true,
      fullEvery: 99,
      ...(audit ? { audit: auditor(P, seed) } : {}),
    }),
  },
  {
    name: 'round + reactive, skip if unchanged',
    c: (id) => ({ id, policy: 'round', params: P, onInvalid: 'replan', skipSame: true }),
  },
];

it('Q2: plan reuse', () => {
  const rows: (CellRow & { group: string; policy: string })[] = [];
  const names = process.env.Q2_POLICIES?.split('|');
  for (const pol of POLICIES.filter((p) => !names || names.includes(p.name))) {
    for (const [name, make] of [
      ['daze-finish', daze],
      ['hide-lethal', hide],
    ] as const) {
      const row = runCell({
        label: `${name} · ${pol.name}`,
        make,
        controllers: (seed) => [pol.c('me', seed)],
        seeds: 30,
        cap: 8,
        focus: 'me',
      });
      console.log(line(row));
      rows.push({ ...row, group: name, policy: pol.name });
    }
    for (const [a, b] of PAIRS) {
      const row = runCell({
        label: `${a}-v-${b} · ${pol.name}`,
        make: () => benchDuel(cast(a), cast(b)),
        controllers: (seed) => [pol.c('player', seed)],
        seeds: Number(process.env.SEEDS ?? 6),
        cap: 16,
        focus: 'player',
      });
      console.log(line(row));
      rows.push({ ...row, group: `${a}-v-${b}`, policy: pol.name });
    }
  }
  save(`q2-${process.env.TAG ?? 'all'}`, rows);
});
