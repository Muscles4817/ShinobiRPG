import { vi } from 'vitest';

import type * as Ladder from '@/systems/combat/engines/plan/mind/planner/ladder';

import { CAST_IDS, type CastId } from '../../src/test/bench/matrixCast';
import { bout } from '../../src/test/bench/planner';

/**
 * Why do three kits fight worse thinking ahead (`docs/design/research/planner-foes.md`)? Each
 * hypothesis is a knob on the planner's ladder, turned for the whole run: more seeds (noise), a
 * longer horizon, no misjudging the foe (insight should read exactly), and a much bigger budget.
 * The same fights, the same seeds, each regressed foe against the whole cast.
 */

type Knob = {
  readonly rollouts?: number;
  readonly blur0?: boolean;
  readonly horizon?: number;
  readonly budget?: number;
};
const knob = vi.hoisted(() => ({
  now: {} as { rollouts?: number; blur0?: boolean; horizon?: number; budget?: number },
}));

vi.mock('@/systems/combat/engines/plan/mind/planner/ladder', async (original) => {
  const real = await original<typeof Ladder>();
  const tiers = new Proxy(real.TIERS, {
    get(target, grade: string) {
      const t = target[grade as keyof typeof target];
      if (!t) return t;
      return {
        ...t,
        ...(knob.now.rollouts ? { rollouts: knob.now.rollouts } : {}),
        ...(knob.now.blur0 ? { blur: 0 } : {}),
      };
    },
  });
  return {
    ...real,
    TIERS: tiers,
    get HORIZON() {
      return knob.now.horizon ?? real.HORIZON;
    },
    roundBudget: (n: number) => (knob.now.budget ?? 1) * real.roundBudget(n),
  };
});

const FOES: readonly CastId[] = ['foresight', 'mimic', 'mistBlade'];
const SEEDS = 2;

const VARIANTS: readonly (readonly [string, Knob | null])[] = [
  ['today', null],
  ['thinking', {}],
  ['blur 0', { blur0: true }],
  ['seeds ×4', { rollouts: 24, budget: 4 }],
  ['horizon 3', { horizon: 3, budget: 2 }],
];

it('who regresses, and why', () => {
  const lines = [
    '| Foe | ' + VARIANTS.map(([n]) => n).join(' | ') + ' |',
    '| --- |' + VARIANTS.map(() => ' --- |').join(''),
  ];
  for (const b of FOES) {
    const cells: string[] = [];
    for (const [, k] of VARIANTS) {
      knob.now = k ?? {};
      let won = 0;
      let n = 0;
      for (const a of CAST_IDS) {
        for (let seed = 1; seed <= SEEDS; seed++) {
          won += bout(a, b, { seed, planner: k !== null }).foeWon ? 1 : 0;
          n += 1;
        }
      }
      cells.push(`${((100 * won) / n).toFixed(0)}%`);
    }
    lines.push(`| ${b} | ${cells.join(' | ')} |`);
    console.warn(lines.at(-1));
  }
  console.warn(lines.join('\n'));
});
