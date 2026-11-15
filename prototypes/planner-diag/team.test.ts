import { vi } from 'vitest';

import type * as Team from '@/systems/combat/engines/plan/mind/planner/team';

import { CAST_IDS } from '../../src/test/bench/matrixCast';
import { castSide, fightSides, teams } from './wide';

/**
 * How a side of thinking foes should share a round's thinking (`mind/planner/team.ts`). Teams of
 * two and three from the cast at chūnin, each fight on the same seed under today's AI and each way.
 * `TEAM_VARIANT` picks the way; `TEAM_SIZE` the size.
 */

const knobs = vi.hoisted(() => ({ sequential: false, spotlight: false, budgetScale: 1 }));
vi.mock('@/systems/combat/engines/plan/mind/planner/team', async (original) => {
  await original<typeof Team>();
  return { TEAM_PLANNING: knobs };
});

const VARIANTS: Readonly<Record<string, Partial<typeof knobs> | null>> = {
  today: null,
  current: {},
  sequential: { sequential: true },
  'sequential ×3': { sequential: true, budgetScale: 3 },
  spotlight: { spotlight: true },
};

const variant = process.env.TEAM_VARIANT ?? 'current';
const size = Number(process.env.TEAM_SIZE ?? 2);
const FIGHTS = 300;

it('team', () => {
  const sides = teams(CAST_IDS, size, FIGHTS, size * 31);
  const foes = teams(CAST_IDS, size, FIGHTS, size * 97);
  const k = VARIANTS[variant];
  Object.assign(knobs, { sequential: false, spotlight: false, budgetScale: 1 }, k ?? {});
  let won = 0;
  let margin = 0;
  let ms = 0;
  let n = 0;
  for (let i = 0; i < FIGHTS; i++) {
    for (const seed of [11, 12]) {
      const o = fightSides(
        { side: castSide(sides[i]!, 'chunin', 'p'), foes: castSide(foes[i]!, 'chunin', 'foe') },
        { seed, planner: k !== null },
      );
      won += o.foeWon ? 1 : 0;
      margin += o.margin;
      ms += o.ms;
      n += 1;
    }
  }
  console.warn(
    `RESULT ${size}v${size} ${variant}: ${n} fights, foe wins ${((100 * won) / n).toFixed(1)}%, margin ${(margin / n).toFixed(3)}, ${(ms / n).toFixed(0)} ms a fight`,
  );
});
