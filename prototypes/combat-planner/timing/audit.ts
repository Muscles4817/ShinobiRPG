import type { CardId } from '@/systems/combat/engines/plan/state';

import type { Auditor } from './loop';
import { enginePick, plan, type MindParams } from './mind';
import { Model } from './model';

/**
 * The regret of a step played without a fresh full plan (a kept round-plan step, or a warm
 * start's choice): the same mind plans afresh from the same state, and a referee (the true
 * state, 16 seeds no planner uses) scores the fresh plan's sequence and the one played. Regret
 * is the referee's value of the fresh choice minus the played one's; negative when the kept
 * plan was in fact the better bet. Untimed: it is not part of any policy's cost.
 */

const REFEREE_SEEDS = 5_000;
const REFEREE_ROLLOUTS = 16;

export function auditor(params: MindParams, fightSeed: number): Auditor {
  return (state, selfId, { tail }) => {
    const fresh = plan({ state, selfId, params, expertise: true, fightSeed });
    const freshSeq = fresh.best.sequence;
    if (freshSeq.length === 0) return { agreed: true, regret: 0 };
    // An empty tail is the default plan: it agrees when it would play the fresh plan's card.
    const self = state.fighters.find((f) => f.id === selfId)!;
    const agreed = freshSeq[0] === (tail[0] ?? enginePick(state, self));
    if (agreed && freshSeq.join() === tail.join()) return { agreed, regret: 0 };
    const ref = new Model(state, selfId, { seedBase: REFEREE_SEEDS, ownHurt: 1 });
    const h = (s: readonly CardId[]) => Math.max(params.horizon, s.length);
    const horizon = Math.max(h(freshSeq), h(tail));
    const score = (s: readonly CardId[]) => ref.score(s, horizon, REFEREE_ROLLOUTS);
    return { agreed, regret: score(freshSeq) - score(tail) };
  };
}
