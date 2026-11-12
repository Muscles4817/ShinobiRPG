import { createRng } from '@/core';
import { createPlanEngine } from '@/systems/combat/engines/plan/engine';
import { decode, type PlanState } from '@/systems/combat/engines/plan/state';
import { toSetup } from '@/test/bench/fighters';
import { castMember, type CastId } from '@/test/bench/matrixCast';

import { playExchange } from '../../forward';

/**
 * What one real exchange costs as fighters are added (1v1, 2v2, 3v3), loud and silent: the
 * planner's budget scales with this, times the exchanges each decision simulates, times the
 * fighters that decide.
 */

const setSilent = (on: boolean) => ((globalThis as { __SILENT__?: boolean }).__SILENT__ = on);

const MINE: readonly CastId[] = ['rusher', 'versatile', 'stalker'];
const THEIRS: readonly CastId[] = ['powerhouse', 'illusionist', 'mistBlade'];

function teams(n: number): PlanState {
  const engine = createPlanEngine();
  const [lead, ...allies] = MINE.slice(0, n).map((id) => castMember(id, 'chunin'));
  const started = engine.start(
    {
      player: toSetup(lead!, 'player'),
      allies: allies.map((a, i) => toSetup(a, `ally-${i}`)),
      enemies: THEIRS.slice(0, n).map((id, i) => toSetup(castMember(id, 'chunin'), `foe-${i}`)),
      canFlee: false,
    },
    createRng(1),
  );
  return { ...decode(started), phase: 'fight' };
}

function perExchange(start: PlanState, lean: boolean): number {
  const EXCHANGES = 400;
  let s = start;
  let played = 0;
  const began = performance.now();
  for (let i = 0; played < EXCHANGES; i++) {
    if (s.result || i % 6 === 0) s = start; // stay in the early fight, where decisions are made
    s = playExchange(lean ? { ...s, log: [] } : s, 77 * i + 5);
    played++;
  }
  return ((performance.now() - began) / played) * 1000;
}

it('costs per exchange by fighters', () => {
  for (const n of [1, 2, 3]) {
    const start = teams(n);
    perExchange(start, false); // warm up
    setSilent(false);
    const loud = perExchange(start, false);
    setSilent(true);
    const quiet = perExchange(start, true);
    setSilent(false);
    console.log(
      `${n}v${n}: loud ${loud.toFixed(0)} µs/exchange, silent ${quiet.toFixed(0)} µs/exchange`,
    );
  }
});
