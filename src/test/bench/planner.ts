import { createRng } from '@/core';
import { createPlanEngine, type CombatState } from '@/systems/combat';
import { decode } from '@/systems/combat/engines/plan/state';

import { toSetup } from './fighters';
import { castMember, type CastId } from './matrixCast';
import { STALEMATE_EXCHANGES } from './runner';

/**
 * Thinking foes against today's (`engines/plan/mind/planner/`): the same watched fight, the same
 * seed, with the foe on today's AI and then on the planner (`CombatExperiments.planner`).
 */

export interface Bout {
  /** The foe won. */
  readonly foeWon: boolean;
  /** The foe's health share left, less the player's. */
  readonly margin: number;
  readonly exchanges: number;
  readonly ms: number;
}

export function bout(
  a: CastId,
  b: CastId,
  { seed, planner }: { seed: number; planner: boolean },
): Bout {
  const engine = createPlanEngine();
  const rng = createRng(seed);
  const began = performance.now();
  let state: CombatState = engine.start(
    {
      player: toSetup(castMember(a, 'chunin'), 'player'),
      allies: [],
      enemies: [toSetup(castMember(b, 'chunin'), 'foe')],
      canFlee: false,
      watch: true,
      ...(planner ? { experiments: { planner: true } } : {}),
    },
    rng,
  );
  let n = 0;
  for (; n < STALEMATE_EXCHANGES && !engine.outcome(state); n++) {
    const next = engine.act(state, { optionId: 'next' }, rng);
    if (!next.ok) throw new Error(next.error);
    state = next.value;
  }
  const end = decode(state);
  const share = (id: string) => {
    const f = end.fighters.find((x) => x.id === id);
    return f ? Math.max(0, f.health) / f.maxHealth : 0;
  };
  return {
    foeWon: engine.outcome(state)?.result === 'defeat',
    margin: share('foe') - share('player'),
    exchanges: n,
    ms: performance.now() - began,
  };
}
