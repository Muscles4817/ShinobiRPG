import { decisionStates } from '../perf/states';
import { mean, quantile, save } from './fixtures';
import { canPlayNow, missingFacts, triggersFor } from './loop';
import { exchange } from './model';
import { GRADES, LADDER, LADDER_V2, LADDER_V3, PERF_GOAP, plan, type MindParams } from './mind';

/**
 * Uncontended timing (run ALONE): one decision per tier on the perf study's 42 decision states,
 * and what the reactive layer's checks cost. Results in `out/timing.json`.
 */

it('times one decision per tier, and the reactive checks', () => {
  const states = decisionStates();
  const v1 = process.env.V1 === '1';
  const tiers: [string, MindParams][] = [
    ...(v1 ? GRADES.map((g): [string, MindParams] => [`v1 ${g}`, LADDER[g]]) : []),
    ...GRADES.map((g): [string, MindParams] => [`v2 ${g}`, LADDER_V2[g]]),
    ['v3 S', LADDER_V3.S],
    ['perf GOAP r8', PERF_GOAP],
  ];
  // Warm up the JIT.
  for (const d of states.slice(0, 10))
    plan({ state: d.state, selfId: d.selfId, params: LADDER.C, expertise: true, fightSeed: 1 });
  const rows: Record<string, unknown>[] = [];
  for (const expertise of [false, true]) {
    for (const [tier, params] of tiers) {
      const ms: number[] = [];
      const ex: number[] = [];
      const cands: number[] = [];
      for (const d of states) {
        const p = plan({ state: d.state, selfId: d.selfId, params, expertise, fightSeed: 7 });
        ms.push(p.ms);
        ex.push(p.exchanges);
        cands.push(p.candidates);
      }
      const row = {
        tier,
        expertise,
        median: quantile(ms, 0.5),
        p95: quantile(ms, 0.95),
        max: Math.max(...ms),
        exchanges: mean(ex),
        candidates: mean(cands),
        usPerExchange: (1000 * ms.reduce((a, b) => a + b, 0)) / ex.reduce((a, b) => a + b, 0),
      };
      console.log(JSON.stringify(row));
      rows.push(row);
    }
  }
  // A warm re-score (the tail of the plan and its top four alternatives, no fresh candidates),
  // as the sharp tiers make each exchange after the first: timed on the same states, warmed
  // from a full plan of the same state.
  for (const g of ['B', 'A', 'S', 'S3'] as const) {
    const params = g === 'S3' ? LADDER_V3.S : LADDER_V2[g];
    const ms: number[] = [];
    const ex: number[] = [];
    for (const d of states) {
      const full = plan({
        state: d.state,
        selfId: d.selfId,
        params,
        expertise: true,
        fightSeed: 7,
      });
      const also = full.ranked
        .slice(0, 4)
        .flatMap((x) => [[...x.sequence], ...(x.sequence.length > 1 ? [x.sequence.slice(1)] : [])]);
      const warm = plan({
        state: d.state,
        selfId: d.selfId,
        params,
        expertise: true,
        fightSeed: 7,
        also,
        onlyAlso: true,
      });
      ms.push(warm.ms);
      ex.push(warm.exchanges);
    }
    const row = {
      tier: `v2 ${g} warm re-score`,
      expertise: true,
      median: quantile(ms, 0.5),
      p95: quantile(ms, 0.95),
      max: Math.max(...ms),
      exchanges: mean(ex),
    };
    console.log(JSON.stringify(row));
    rows.push(row);
  }
  // The reactive layer: triggers, playability and relied facts, per fighter per exchange.
  const pairs = states.map((d) => ({
    before: d.state,
    after: exchange(d.state, 99),
    id: d.selfId,
  }));
  const N = 200;
  const began = performance.now();
  for (let i = 0; i < N; i++) {
    for (const { before, after, id } of pairs) {
      triggersFor(before, after, id);
      const self = after.fighters.find((f) => f.id === id)!;
      canPlayNow(after, self, 'strike');
      missingFacts(after, self, ['open', 'unseen']);
    }
  }
  const usPerCheck = ((performance.now() - began) * 1000) / (N * pairs.length);
  console.log(`reactive checks: ${usPerCheck.toFixed(1)} µs per fighter per exchange`);
  rows.push({ reactiveChecksUs: usPerCheck });
  save(`timing-${process.env.TAG ?? 'alone'}`, rows);
});
