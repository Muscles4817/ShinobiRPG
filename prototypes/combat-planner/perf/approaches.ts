import { approxPlanner, hybridPlanner } from './approx';
import { DecisionTable, memoPlanner, type MemoStats } from './cache';
import {
  beamPlanner,
  goapPlanner,
  goapRacingPlanner,
  racingPlanner,
  selectivePlanner,
  type Planner,
} from './planners';
import { advance, benchDuel, daze, hide, PAIRS } from './states';
import { castMember } from '@/test/bench/matrixCast';

/**
 * Every approach compared, by name and category. A factory, so each run starts clean (caches
 * empty, counters zero). `stats` reports approach-specific counts (cache hits).
 */

export interface Approach {
  readonly name: string;
  readonly category: 'exact' | 'width/depth' | 'goal-directed' | 'approximate' | 'cached';
  readonly make: () => { planner: Planner; stats?: () => string };
}

const beam = (depth: number, width: number, rollouts: number, share = true) =>
  beamPlanner({ depth, width, rollouts, share });

/** Fills a decision table from default-plan fights on seeds the decision states never use. */
function trainedTable(): DecisionTable {
  const table = new DecisionTable('coarse', beam(2, 2, 8));
  const scenarios = [
    { make: daze, selfId: 'me' },
    { make: hide, selfId: 'me' },
    ...PAIRS.map(([a, b]) => ({
      make: () => benchDuel(castMember(a, 'chunin'), castMember(b, 'chunin')),
      selfId: 'player',
    })),
  ];
  for (const sc of scenarios) {
    const start = sc.make();
    for (let seed = 11; seed <= 14; seed++) {
      for (let n = 0; n <= 6; n++) {
        const s = advance(start, n, seed);
        if (s) table.learn(s, sc.selfId);
      }
    }
  }
  table.hits = 0;
  table.lookups = 0;
  return table;
}

const memo = (grain: 'fine' | 'coarse') => () => {
  const stats: MemoStats = { hits: 0, lookups: 0 };
  return {
    planner: memoPlanner({ width: 4, rollouts: 16, grain }, stats),
    stats: () =>
      `leaf hits ${stats.hits}/${stats.lookups} (${((100 * stats.hits) / Math.max(1, stats.lookups)).toFixed(0)}%)`,
  };
};

export const APPROACHES: readonly Approach[] = [
  {
    name: 'baseline: prototype beam d2 w4 r16',
    category: 'exact',
    make: () => ({ planner: beam(2, 4, 16, false) }),
  },
  {
    name: 'E1 prefix sharing (d2 w4 r16)',
    category: 'exact',
    make: () => ({ planner: beam(2, 4, 16) }),
  },
  { name: 'greedy d1 r16', category: 'width/depth', make: () => ({ planner: beam(1, 4, 16) }) },
  { name: 'd2 w1 r16', category: 'width/depth', make: () => ({ planner: beam(2, 1, 16) }) },
  { name: 'd2 w2 r16', category: 'width/depth', make: () => ({ planner: beam(2, 2, 16) }) },
  { name: 'd2 w2 r8', category: 'width/depth', make: () => ({ planner: beam(2, 2, 8) }) },
  { name: 'd2 w4 r8', category: 'width/depth', make: () => ({ planner: beam(2, 4, 8) }) },
  { name: 'd2 w4 r4', category: 'width/depth', make: () => ({ planner: beam(2, 4, 4) }) },
  { name: 'd2 w1 r4', category: 'width/depth', make: () => ({ planner: beam(2, 1, 4) }) },
  { name: 'd2 w4 r32', category: 'width/depth', make: () => ({ planner: beam(2, 4, 32) }) },
  { name: 'd3 w2 r8', category: 'width/depth', make: () => ({ planner: beam(3, 2, 8) }) },
  {
    name: 'selective depth r8 w2 (margin 10)',
    category: 'width/depth',
    make: () => ({ planner: selectivePlanner({ rollouts: 8, width: 2, margin: 10 }) }),
  },
  {
    name: 'selective depth r16 w4 (margin 15)',
    category: 'width/depth',
    make: () => ({ planner: selectivePlanner({ rollouts: 16, width: 4, margin: 15 }) }),
  },
  {
    name: 'racing 4→32 keep 4',
    category: 'goal-directed',
    make: () => ({ planner: racingPlanner({ start: 4, max: 32, keep: 4 }) }),
  },
  {
    name: 'racing 2→16 keep 2',
    category: 'goal-directed',
    make: () => ({ planner: racingPlanner({ start: 2, max: 16, keep: 2 }) }),
  },
  {
    name: 'GOAP pairs r16',
    category: 'goal-directed',
    make: () => ({ planner: goapPlanner({ rollouts: 16, widthOne: false }) }),
  },
  {
    name: 'GOAP pairs r8',
    category: 'goal-directed',
    make: () => ({ planner: goapPlanner({ rollouts: 8, widthOne: false }) }),
  },
  {
    name: 'GOAP pairs + w1 r8',
    category: 'goal-directed',
    make: () => ({ planner: goapPlanner({ rollouts: 8, widthOne: true }) }),
  },
  {
    name: 'approx model d2',
    category: 'approximate',
    make: () => ({ planner: approxPlanner({ depth: 2 }) }),
  },
  {
    name: 'approx model d3',
    category: 'approximate',
    make: () => ({ planner: approxPlanner({ depth: 3 }) }),
  },
  {
    name: 'hybrid: approx top 2 → real r8',
    category: 'approximate',
    make: () => ({ planner: hybridPlanner({ keep: 2, rollouts: 8 }) }),
  },
  {
    name: 'hybrid: approx top 3 → real r16',
    category: 'approximate',
    make: () => ({ planner: hybridPlanner({ keep: 3, rollouts: 16 }) }),
  },
  { name: 'leaf memo, fine key (d2 w4 r16)', category: 'cached', make: memo('fine') },
  { name: 'leaf memo, coarse key (d2 w4 r16)', category: 'cached', make: memo('coarse') },
  {
    name: 'GOAP pairs r4',
    category: 'goal-directed',
    make: () => ({ planner: goapPlanner({ rollouts: 4, widthOne: false }) }),
  },
  {
    name: 'racing 1→8 keep 2',
    category: 'goal-directed',
    make: () => ({ planner: racingPlanner({ start: 1, max: 8, keep: 2 }) }),
  },
  {
    name: 'GOAP candidates raced 2→16 keep 2',
    category: 'goal-directed',
    make: () => ({ planner: goapRacingPlanner({ start: 2, max: 16, keep: 2 }) }),
  },
  {
    name: 'GOAP candidates raced 4→32 keep 2',
    category: 'goal-directed',
    make: () => ({ planner: goapRacingPlanner({ start: 4, max: 32, keep: 2 }) }),
  },
  {
    name: 'decision table, coarse key, offline (fallback d2 w2 r8)',
    category: 'cached',
    make: () => {
      const t = trainedTable();
      return {
        planner: t.planner,
        stats: () => `table ${t.table.size} entries, hits ${t.hits}/${t.lookups}`,
      };
    },
  },
];
