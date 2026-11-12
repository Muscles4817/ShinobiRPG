import type { CardId, PlanState } from '@/systems/combat/engines/plan/state';

import { enablingPairs } from './goap';
import { Sim } from './sim';

/**
 * The real-engine planners compared in `RESULTS.md`. Each takes a decision state and returns the
 * first card it would play, with what it cost. All score sequences with `Sim` (the real exchange,
 * the planner's own seeds 1..n, as `beam.ts` does), so they differ only in which sequences they
 * score and over how many seeds.
 */

export interface Decision {
  readonly first: CardId;
  /** The best sequence's value as the approach itself scored it. */
  readonly value: number;
  readonly exchanges: number;
  /** Approximate-model evaluations (sequence-steps), for model-based approaches. */
  readonly evals: number;
  readonly ms: number;
  /** Anything approach-specific worth reporting (a cache hit, a deepening). */
  readonly note?: string;
  readonly sequence?: readonly CardId[];
}

export type Planner = (start: PlanState, selfId: string) => Decision;

interface Scored {
  readonly sequence: readonly CardId[];
  readonly value: number;
}

const PLANNER_SEEDS = 1;

const sim = (start: PlanState, selfId: string, share: boolean) =>
  new Sim(start, selfId, { share, seedBase: PLANNER_SEEDS, ownHurt: 1 });

function done(s: Sim, began: number, best: Scored, note?: string): Decision {
  return {
    first: best.sequence[0]!,
    value: best.value,
    exchanges: s.exchanges,
    evals: 0,
    ms: performance.now() - began,
    sequence: best.sequence,
    ...(note ? { note } : {}),
  };
}

/** The prototype's beam (`beam.ts`), step for step, including its dedupe by equal value. */
export function beamSearch(
  s: Sim,
  o: { readonly depth: number; readonly width: number; readonly rollouts: number },
  firsts: readonly CardId[] = s.first,
): Scored[] {
  let frontier: Scored[] = [{ sequence: [], value: 0 }];
  for (let d = 1; d <= o.depth; d++) {
    const grown = frontier.flatMap((p) =>
      (d === 1 ? firsts : s.actions).map((a) => {
        const sequence = [...p.sequence, a];
        return { sequence, value: s.score(sequence, o.depth, o.rollouts) };
      }),
    );
    const distinct = grown.filter((g, i) => grown.findIndex((x) => x.value === g.value) === i);
    distinct.sort((a, b) => b.value - a.value);
    frontier = d === o.depth ? distinct : distinct.slice(0, o.width);
  }
  return frontier;
}

export interface BeamOptions {
  readonly depth: number;
  readonly width: number;
  readonly rollouts: number;
  /** Keep prefix states per seed (exact, `sim.ts`). */
  readonly share: boolean;
}

/** The prototype's beam planner, with or without prefix sharing. */
export const beamPlanner =
  (o: BeamOptions): Planner =>
  (start, selfId) => {
    const began = performance.now();
    const s = sim(start, selfId, o.share);
    return done(s, began, beamSearch(s, o)[0]!);
  };

/**
 * Selective depth: score every first card followed by the default plan (horizon 2); if the best
 * leads the runner-up by more than `margin`, play it; otherwise search depth 2 from the top
 * `width` first cards.
 */
export const selectivePlanner =
  (o: { readonly rollouts: number; readonly width: number; readonly margin: number }): Planner =>
  (start, selfId) => {
    const began = performance.now();
    const s = sim(start, selfId, true);
    const one = s.first
      .map((a) => ({ sequence: [a], value: s.score([a], 2, o.rollouts) }))
      .sort((a, b) => b.value - a.value);
    const lead = one.length > 1 ? one[0]!.value - one[1]!.value : Infinity;
    if (lead > o.margin) return done(s, began, one[0]!, 'shallow');
    const firsts = one.slice(0, o.width).map((x) => x.sequence[0]!);
    const deep = beamSearch(s, { depth: 2, width: o.width, rollouts: o.rollouts }, firsts);
    return done(s, began, deep[0]!, 'deepened');
  };

/**
 * Racing (successive halving) over every two-card sequence: all start with `start` seeds, the
 * better half goes on with twice as many, until `keep` are left or `max` seeds are reached.
 */
export const racingPlanner =
  (o: { readonly start: number; readonly max: number; readonly keep: number }): Planner =>
  (start, selfId) => {
    const began = performance.now();
    const s = sim(start, selfId, true);
    const pool = s.first.flatMap((a) => s.actions.map((b): CardId[] => [a, b]));
    return done(s, began, race(s, pool, o));
  };

/** Successive halving over candidate sequences (horizon 2): the better half gets twice the seeds. */
function race(
  s: Sim,
  candidates: readonly (readonly CardId[])[],
  o: { readonly start: number; readonly max: number; readonly keep: number },
): Scored {
  let pool = candidates.map((sequence) => ({ sequence, sum: 0, n: 0 }));
  let n = o.start;
  for (;;) {
    for (const c of pool) {
      for (let i = c.n; i < n; i++) c.sum += s.leafValue(c.sequence, 2, i);
      c.n = n;
    }
    pool.sort((a, b) => b.sum / b.n - a.sum / a.n);
    if (pool.length <= o.keep || n >= o.max) break;
    pool = pool.slice(0, Math.max(o.keep, Math.ceil(pool.length / 2)));
    n = Math.min(o.max, n * 2);
  }
  const best = pool[0]!;
  return { sequence: best.sequence, value: best.sum / best.n };
}

/** GOAP's candidates (every first card + default, and the enabling pairs), raced. */
export const goapRacingPlanner =
  (o: { readonly start: number; readonly max: number; readonly keep: number }): Planner =>
  (start, selfId) => {
    const began = performance.now();
    const s = sim(start, selfId, true);
    const pool: CardId[][] = [
      ...s.first.map((a) => [a]),
      ...enablingPairs(start, selfId, s.first, s.actions),
    ];
    return done(s, began, race(s, pool, o));
  };

/**
 * GOAP-proposed candidates: every first card followed by the default plan, plus only the pairs
 * where the first card makes a precondition of the second true (`goap.ts`). With `widthOne`, the
 * best first card is also extended by every card (a safety net for what the schema can't see).
 */
export const goapPlanner =
  (o: { readonly rollouts: number; readonly widthOne: boolean }): Planner =>
  (start, selfId) => {
    const began = performance.now();
    const s = sim(start, selfId, true);
    const scored: Scored[] = s.first.map((a) => ({
      sequence: [a],
      value: s.score([a], 2, o.rollouts),
    }));
    for (const pair of enablingPairs(start, selfId, s.first, s.actions)) {
      scored.push({ sequence: pair, value: s.score(pair, 2, o.rollouts) });
    }
    if (o.widthOne) {
      const top = [...scored].sort((a, b) => b.value - a.value)[0]!.sequence[0]!;
      for (const b of s.actions) {
        const sequence = [top, b];
        if (!scored.some((x) => x.sequence.join() === sequence.join()))
          scored.push({ sequence, value: s.score(sequence, 2, o.rollouts) });
      }
    }
    scored.sort((a, b) => b.value - a.value);
    return done(s, began, scored[0]!);
  };
