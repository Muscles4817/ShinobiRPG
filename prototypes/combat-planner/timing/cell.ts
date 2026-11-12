import type { PlanState } from '@/systems/combat/engines/plan/state';

import { addCounts, combosIn, mean, quantile, summary } from './fixtures';
import { fight, type Controller, type FightOut } from './loop';

/** One cell of an experiment: a fight shape, controllers, seeds; aggregated for a focus fighter. */

export interface Cell {
  readonly label: string;
  readonly make: () => PlanState;
  readonly controllers: (seed: number) => readonly Controller[];
  readonly seeds: number;
  readonly cap: number;
  /** The fighter whose planning is reported. */
  readonly focus: string;
  /** Seed offset, so cells can share or avoid seeds. */
  readonly seedFrom?: number;
}

export interface CellRow {
  readonly label: string;
  readonly fights: number;
  readonly won: number;
  readonly lost: number;
  readonly dealt: number;
  readonly taken: number;
  readonly exchanges: number;
  readonly rounds: number;
  /** Focus fighter: planning per fight and per round. */
  readonly msPerFight: number;
  readonly msPerRound: number;
  readonly msPerRoundP95: number;
  readonly plansPerRound: number;
  readonly lightPerRound: number;
  readonly exchangesSimPerRound: number;
  readonly kept: number;
  readonly defaulted: number;
  readonly skipped: number;
  readonly warmPlans: number;
  readonly invalid: Record<string, number>;
  readonly audits: number;
  readonly agreed: number;
  readonly regretMean: number;
  readonly regretP90: number;
  readonly combos: Record<string, number>;
  readonly openings: Record<string, number>;
  /** All fighters' planning ms per round (every planner together). */
  readonly allMsPerRound: number;
  readonly allMsPerRoundP95: number;
  /** All planners: sim exchanges per round; ms at round starts per round; ms inside an exchange gap. */
  readonly allExPerRound: number;
  readonly allMsStartPerRound: number;
  readonly allMidGapP50: number;
  readonly allMidGapP95: number;
}

export function runCell(cell: Cell): CellRow {
  const outs: FightOut[] = [];
  for (let i = 0; i < cell.seeds; i++) {
    const seed = (cell.seedFrom ?? 0) + i + 1;
    outs.push(fight(cell.make(), cell.controllers(seed), { seed, cap: cell.cap }));
  }
  return rowOf(cell.label, cell.focus, outs);
}

export function rowOf(label: string, focus: string, outs: readonly FightOut[]): CellRow {
  const t = outs.map((o) => o.tallies[focus]!);
  const rounds = outs.map((o) => Math.ceil(o.exchanges / 4));
  const totalRounds = rounds.reduce((a, b) => a + b, 0);
  const perRound: number[] = [];
  const allPerRound: number[] = [];
  const allEx: number[] = [];
  const gaps: number[] = [];
  let startMs = 0;
  for (const o of outs) {
    const f = o.tallies[focus]!;
    const n = Math.ceil(o.exchanges / 4);
    for (let r = 1; r <= n; r++) perRound.push(f.msByRound[r] ?? 0);
    for (let r = 1; r <= n; r++) {
      allPerRound.push(Object.values(o.tallies).reduce((s, x) => s + (x.msByRound[r] ?? 0), 0));
      allEx.push(Object.values(o.tallies).reduce((s, x) => s + (x.exByRound[r] ?? 0), 0));
      // Each gap between exchanges inside the round (all planners deciding there).
      for (let e = 1; e < 4; e++)
        gaps.push(Object.values(o.tallies).reduce((s, x) => s + (x.msMid[`${r}.${e}`] ?? 0), 0));
    }
    startMs += Object.values(o.tallies).reduce((s, x) => s + x.msStart, 0);
  }
  const invalid: Record<string, number> = {};
  const combos: Record<string, number> = {};
  const openings: Record<string, number> = {};
  for (const x of t) {
    addCounts(invalid, x.invalid);
    addCounts(combos, combosIn(x.played));
    const open = x.played
      .slice(0, 2)
      .map((p) => p.slice(p.indexOf(':') + 1))
      .join('>');
    openings[open] = (openings[open] ?? 0) + 1;
  }
  const audits = t.flatMap((x) => x.audits);
  const sum = (
    k: 'ms' | 'plans' | 'lightPlans' | 'exchanges' | 'kept' | 'defaulted' | 'skipped' | 'warmPlans',
  ) => t.reduce((s, x) => s + x[k], 0);
  // Wins, dealt and taken from the focus fighter's side.
  const p = summary(outs);
  const s = focus.startsWith('foe')
    ? { ...p, won: p.lost, lost: p.won, dealt: p.taken, taken: p.dealt }
    : p;
  return {
    label,
    ...s,
    rounds: totalRounds / outs.length,
    msPerFight: sum('ms') / outs.length,
    msPerRound: sum('ms') / totalRounds,
    msPerRoundP95: quantile(perRound, 0.95),
    plansPerRound: sum('plans') / totalRounds,
    lightPerRound: sum('lightPlans') / totalRounds,
    exchangesSimPerRound: sum('exchanges') / totalRounds,
    kept: sum('kept'),
    defaulted: sum('defaulted'),
    skipped: sum('skipped'),
    warmPlans: sum('warmPlans'),
    invalid,
    audits: audits.length,
    agreed: audits.length ? audits.filter((a) => a.agreed).length / audits.length : 1,
    regretMean: mean(audits.map((a) => a.regret)),
    regretP90: quantile(
      audits.map((a) => a.regret),
      0.9,
    ),
    combos,
    openings: Object.fromEntries(
      Object.entries(openings)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    ),
    allMsPerRound: mean(allPerRound),
    allMsPerRoundP95: quantile(allPerRound, 0.95),
    allExPerRound: mean(allEx),
    allMsStartPerRound: startMs / Math.max(1, totalRounds),
    allMidGapP50: quantile(gaps, 0.5),
    allMidGapP95: quantile(gaps, 0.95),
  };
}

export function line(r: CellRow): string {
  const f = (x: number, d = 0) => x.toFixed(d);
  return [
    r.label.padEnd(44),
    `won ${r.won}/${r.fights}`,
    `dealt ${f(r.dealt)} taken ${f(r.taken)}`,
    `ms/round ${f(r.msPerRound)} (p95 ${f(r.msPerRoundP95)})`,
    `plans/round ${f(r.plansPerRound, 2)} light ${f(r.lightPerRound, 2)}`,
    `sim ex/round ${f(r.exchangesSimPerRound)}`,
    `inv ${JSON.stringify(r.invalid)}`,
    r.audits
      ? `audit n=${r.audits} agree ${f(100 * r.agreed)}% regret ${f(r.regretMean, 1)} p90 ${f(r.regretP90, 1)}`
      : '',
    `combos ${JSON.stringify(r.combos)}`,
    `open ${JSON.stringify(r.openings)}`,
  ].join(' | ');
}
