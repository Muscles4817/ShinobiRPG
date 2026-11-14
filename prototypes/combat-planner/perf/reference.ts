import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import type { DecisionState } from './states';
import { Sim } from './sim';

/**
 * The reference every approach is judged against: the real-engine planner at generous settings.
 * Every first card is extended by every card (depth 2, unbounded width), each pair scored over
 * `REFERENCE_ROLLOUTS` seeds of its own stream (never the planners' seeds 1..n, so an approach
 * doesn't agree with it just by sharing its dice). A first card's reference value is its best
 * pair's mean. The per-seed values are split in two halves to show the reference's own noise.
 */

export const REFERENCE_ROLLOUTS = 64;
const REFERENCE_SEEDS = 100_001;

export interface Reference {
  readonly id: string;
  readonly firsts: number;
  readonly actions: number;
  /** Reference value of each first card (its best pair). */
  readonly q: Readonly<Record<string, number>>;
  /** The same from each half of the seeds. */
  readonly qA: Readonly<Record<string, number>>;
  readonly qB: Readonly<Record<string, number>>;
  readonly best: string;
  readonly bestSequence: readonly string[];
  readonly exchanges: number;
  readonly ms: number;
}

export function buildReference(d: DecisionState): Reference {
  const began = performance.now();
  const s = new Sim(d.state, d.selfId, { share: true, seedBase: REFERENCE_SEEDS, ownHurt: 1 });
  const half = REFERENCE_ROLLOUTS / 2;
  const q: Record<string, number> = {};
  const qA: Record<string, number> = {};
  const qB: Record<string, number> = {};
  let best = { first: '', seq: [] as string[], v: -Infinity };
  for (const a of s.first) {
    q[a] = qA[a] = qB[a] = -Infinity;
    for (const b of s.actions) {
      const values = Array.from({ length: REFERENCE_ROLLOUTS }, (_, i) =>
        s.leafValue([a, b], 2, i),
      );
      const mean = (xs: number[]) => xs.reduce((t, x) => t + x, 0) / xs.length;
      const m = mean(values);
      q[a] = Math.max(q[a]!, m);
      qA[a] = Math.max(qA[a]!, mean(values.slice(0, half)));
      qB[a] = Math.max(qB[a]!, mean(values.slice(half)));
      if (m > best.v) best = { first: a, seq: [a, b], v: m };
    }
  }
  return {
    id: d.id,
    firsts: s.first.length,
    actions: s.actions.length,
    q,
    qA,
    qB,
    best: best.first,
    bestSequence: best.seq,
    exchanges: s.exchanges,
    ms: performance.now() - began,
  };
}

const OUT = new URL('./out/', import.meta.url);
const FILE = new URL('./out/reference.json', import.meta.url);

export function saveReferences(refs: readonly Reference[]): void {
  if (!existsSync(OUT)) mkdirSync(OUT);
  writeFileSync(FILE, JSON.stringify(refs, null, 1));
}

export function loadReferences(): Reference[] {
  return JSON.parse(readFileSync(FILE, 'utf8')) as Reference[];
}

/** The argmax of a value table. */
export function argmax(q: Readonly<Record<string, number>>): string {
  return Object.entries(q).sort((a, b) => b[1] - a[1])[0]![0];
}
