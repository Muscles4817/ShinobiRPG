import { PAIRS, benchDuel, daze, hide } from '../perf/states';
import { auditor } from './audit';
import { runCell, line, type CellRow } from './cell';
import { cast, save } from './fixtures';
import type { Controller } from './loop';
import { PERF_GOAP, lightOf, type MindParams } from './mind';

/**
 * Q1: plan once per round with a light reactive layer, against re-planning every exchange. The
 * same search (the perf study's GOAP r8) under every policy, so only the policy differs.
 * `Q1=scenarios|pairs`, `Q1_POLICIES=name|name`.
 */

interface PolicyDef {
  readonly name: string;
  readonly controller: (id: string, seed: number, audit: boolean) => Controller;
}

const P = PERF_GOAP;
const H4: MindParams = { ...P, horizon: 4 };

const POLICIES: readonly PolicyDef[] = [
  { name: 'default plan (engine AI)', controller: (id) => ({ id, policy: 'default' }) },
  { name: 'every exchange', controller: (id) => ({ id, policy: 'exchange', params: P }) },
  {
    name: 'round + reactive (replan)',
    controller: (id, seed, audit) => ({
      id,
      policy: 'round',
      params: P,
      onInvalid: 'replan',
      ...(audit ? { audit: auditor(P, seed) } : {}),
    }),
  },
  {
    name: 'round + reactive (fall back to default)',
    controller: (id) => ({ id, policy: 'round', params: P, onInvalid: 'default' }),
  },
  {
    name: 'round, blind (no reactive layer)',
    controller: (id) => ({ id, policy: 'blind', params: P }),
  },
  {
    name: 'round + reactive (replan), horizon 4',
    controller: (id) => ({ id, policy: 'round', params: H4, onInvalid: 'replan' }),
  },
  {
    name: 'round + light decisions between (invalid: replan)',
    controller: (id, seed, audit) => ({
      id,
      policy: 'round',
      params: P,
      onInvalid: 'replan',
      light: lightOf(P),
      ...(audit ? { audit: auditor(P, seed) } : {}),
    }),
  },
  {
    name: 'round + light decisions between (invalid: light)',
    controller: (id, seed, audit) => ({
      id,
      policy: 'round',
      params: P,
      onInvalid: 'light',
      light: lightOf(P),
      ...(audit ? { audit: auditor(P, seed) } : {}),
    }),
  },
  {
    name: 'round + reactive + surprise 15',
    controller: (id) => ({ id, policy: 'round', params: P, onInvalid: 'replan', surprise: 15 }),
  },
];

const chosen = () => {
  const names = process.env.Q1_POLICIES?.split('|');
  return names ? POLICIES.filter((p) => names.includes(p.name)) : POLICIES;
};

it('Q1: per round vs per exchange', () => {
  const which = process.env.Q1 ?? 'scenarios';
  const rows: (CellRow & { group: string; policy: string })[] = [];
  for (const pol of chosen()) {
    if (which === 'scenarios') {
      for (const [name, make] of [
        ['daze-finish', daze],
        ['hide-lethal', hide],
      ] as const) {
        const row = runCell({
          label: `${name} · ${pol.name}`,
          make,
          controllers: (seed) => [pol.controller('me', seed, false)],
          seeds: 30,
          cap: 8,
          focus: 'me',
        });
        console.log(line(row));
        rows.push({ ...row, group: name, policy: pol.name });
      }
    } else {
      const outs: CellRow[] = [];
      for (const [a, b] of PAIRS) {
        const row = runCell({
          label: `${a}-v-${b} · ${pol.name}`,
          make: () => benchDuel(cast(a), cast(b)),
          controllers: (seed) => [pol.controller('player', seed, process.env.AUDIT === '1')],
          seeds: Number(process.env.SEEDS ?? 6),
          cap: 16,
          focus: 'player',
        });
        console.log(line(row));
        rows.push({ ...row, group: `${a}-v-${b}`, policy: pol.name });
        outs.push(row);
      }
    }
  }
  save(`q1-${which}-${process.env.TAG ?? 'all'}`, rows);
});
