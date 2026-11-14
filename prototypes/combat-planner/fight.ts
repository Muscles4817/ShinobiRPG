import type { PlanState } from '@/systems/combat/engines/plan/state';

import { plan, type Search } from './beam';
import { forcedFor, playExchange } from './forward';

/**
 * A whole fight in the real engine with the planner in charge of one fighter, closed loop: before
 * each exchange it plans from the fight as it now stands, plays only the first card, and the
 * exchange is resolved with the fight's own seeds, which the planner never sees (its rollouts use
 * a separate stream). `search` absent: the fighter plays its own default plan, as today.
 */

export interface FightResult {
  readonly won: boolean;
  readonly dealt: number;
  readonly taken: number;
  readonly exchanges: number;
  readonly planMs: number;
  /** The cards the planner chose, in order (empty on the default plan). */
  readonly chose: readonly string[];
}

const FIGHT_SEED = 1_000_003;

export function fightWith(
  start: PlanState,
  selfId: string,
  fight: { readonly seed: number; readonly cap: number; readonly search?: Search },
): FightResult {
  let state = start;
  let planMs = 0;
  let n = 0;
  const chose: string[] = [];
  for (; n < fight.cap && !state.result; n++) {
    let next = state;
    if (fight.search) {
      const p = plan(state, selfId, fight.search);
      planMs += p.ms;
      chose.push(p.best.sequence[0]!);
      next = forcedFor(state, selfId, p.best.sequence[0]!);
    }
    state = playExchange(next, FIGHT_SEED * fight.seed + n);
    if (fight.search) state = forcedFor(state, selfId, null, start);
  }
  const health = (s: PlanState, enemy: boolean) =>
    s.fighters
      .filter((f) => (f.side === 'enemy') === enemy)
      .reduce((t, f) => t + Math.max(0, f.health), 0);
  return {
    won: state.result === 'victory',
    dealt: health(start, true) - health(state, true),
    taken: health(start, false) - health(state, false),
    exchanges: n,
    planMs,
    chose,
  };
}
