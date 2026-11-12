import { asRound } from '@/systems/combat/engines/plan/intent';
import { fromSlot } from '@/systems/combat/engines/plan/slots';
import type { CardId, PlanState } from '@/systems/combat/engines/plan/state';

import { actionsOf, believed, rollout, type Belief } from './forward';

/**
 * Candidate A of the design (Part 7): utility objective + bounded beam search. This prototype
 * has one objective (wear the foes down without being worn down) and searches sequences of the
 * planner's own cards, a card an exchange.
 *
 * Nothing in here knows what any card is for. Candidates are every card the fighter holds; each
 * sequence is scored only by what the forward model says happens (`forward.ts`): the real
 * exchange, on the fight as believed, over the same seeds for every sequence (common random
 * numbers, so differences come from the choices, not the dice). A prefix is scored by playing it
 * and then the fighter's own default plan to the horizon, so a set-up that only pays later is not
 * pruned for doing nothing now.
 *
 * Two prunings, both the engine's own judgement and neither about combos: a first card the
 * engine would pass over now (Gather on a full tank, Search with nobody hidden, a finisher with
 * nobody open) is dropped, since it would only become the improvised move; and sequences whose
 * outcome is identical on every seed are one sequence.
 */

export interface Search {
  /** Exchanges looked ahead (the horizon), 1 = greedy. */
  readonly depth: number;
  /** Sequences kept at each depth. */
  readonly width: number;
  /** Seeds each sequence is played over. */
  readonly rollouts: number;
  /** Exchanges each sequence is scored over (on the default plan past it); absent: `depth`. */
  readonly horizon?: number;
  /** How much the planner minds its own hurt, against the foe's (risk; 1 = even trade). */
  readonly ownHurt: number;
  readonly belief?: Belief;
}

export interface Scored {
  readonly sequence: readonly CardId[];
  readonly value: number;
}

export interface Planned {
  readonly best: Scored;
  /** Every sequence scored at the last depth, best first. */
  readonly ranked: readonly Scored[];
  /** Real exchanges simulated, for the cost. */
  readonly exchanges: number;
  readonly ms: number;
}

/** How a defeat or a win weighs against health (a fall is worth more than any wound). */
const ENDED = 150;

function healthOf(state: PlanState, side: 'player' | 'enemy'): number {
  return state.fighters
    .filter((f) => (f.side === 'enemy') === (side === 'enemy') && !f.shadowOf)
    .reduce((sum, f) => sum + Math.max(0, f.health), 0);
}

/** The objective's value of an outcome, from the planner's side (it fights as the player). */
export function value(start: PlanState, end: PlanState, ownHurt: number): number {
  const dealt = healthOf(start, 'enemy') - healthOf(end, 'enemy');
  const taken = healthOf(start, 'player') - healthOf(end, 'player');
  const ended = end.result === 'victory' ? ENDED : end.result === 'defeat' ? -ENDED : 0;
  return dealt - ownHurt * taken + ended;
}

function score(start: PlanState, selfId: string, sequence: readonly CardId[], s: Search): number {
  const model = s.belief ? believed(start, s.belief) : start;
  let total = 0;
  for (let seed = 1; seed <= s.rollouts; seed++) {
    const plan = { sequence, thenDefault: (s.horizon ?? s.depth) - sequence.length };
    total += value(model, rollout(model, selfId, plan, seed), s.ownHurt);
  }
  return total / s.rollouts;
}

/** The best sequence of the planner's cards over the horizon. */
export function plan(start: PlanState, selfId: string, s: Search): Planned {
  const began = performance.now();
  const self = start.fighters.find((f) => f.id === selfId)!;
  const now = asRound(start);
  const actions = actionsOf(self);
  const first = actions.filter((id) => fromSlot(self, now, { card: id }) !== null);
  let frontier: Scored[] = [{ sequence: [], value: 0 }];
  let exchanges = 0;
  for (let d = 1; d <= s.depth; d++) {
    const grown = frontier.flatMap((p) =>
      (d === 1 ? first : actions).map((a) => {
        const sequence = [...p.sequence, a];
        exchanges += s.rollouts * s.depth;
        return { sequence, value: score(start, selfId, sequence, s) };
      }),
    );
    const distinct = grown.filter((g, i) => grown.findIndex((o) => o.value === g.value) === i);
    distinct.sort((a, b) => b.value - a.value);
    frontier = d === s.depth ? distinct : distinct.slice(0, s.width);
  }
  return { best: frontier[0]!, ranked: frontier, exchanges, ms: performance.now() - began };
}
