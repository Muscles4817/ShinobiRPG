import { statTier } from '@/systems/stats';

import type { CardId, PlanState } from '../../state';
import type { Objective } from '../shape';
import { candidatesFor, type Candidate } from './candidates';
import type { Fact } from './facts';
import { forwardFrom, silent } from './forward';
import { HORIZON, TIERS } from './ladder';
import { worthOf } from './value';

/**
 * The planner (`docs/design/combat-ai-plan.md` Part 7): the best short sequence of a fighter's own
 * cards towards the objective it holds, as its mind sees the fight. Each candidate (`candidates.ts`)
 * is played out in the real engine (`forward.ts`) over a few seeds of the mind's own, two
 * exchanges deep with its default plan playing on, and valued by its objective (`value.ts`). How
 * much it considers, and how true its read of the others is, comes from its tier (`ladder.ts`);
 * how many exchanges it may simulate comes from the round's budget. No combination is written
 * anywhere: what it plays is what scored best.
 */

export interface PlanRequest {
  readonly state: PlanState;
  readonly selfId: string;
  /** Simulated exchanges it may spend. */
  readonly budget: number;
  /** Where its own seeds start (from the fight, never its Rng). */
  readonly seedBase: number;
}

export interface Planned {
  readonly sequence: readonly CardId[];
  readonly value: number;
  readonly relies: readonly (readonly Fact[])[];
  /** Real exchanges it simulated. */
  readonly simulated: number;
}

/** A fixed fraction from a key: the same misjudgement every time this mind reads this foe. */
function hash01(key: string): number {
  let h = 2166136261;
  for (const ch of key) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
}

/** The fight as this mind believes it: the others' attributes off by its tier's blur, fixed for the fight. */
function believed(state: PlanState, selfId: string, blur: number): PlanState {
  if (blur === 0) return state;
  const off = (fighter: string, stat: string, v: number) =>
    Math.max(0, v * (1 + blur * (2 * hash01(`${selfId}/${fighter}/${stat}`) - 1)));
  const fighters = state.fighters.map((f) => {
    if (f.id === selfId) return f;
    const a = f.attributes;
    const attributes = Object.fromEntries(
      Object.entries(a).map(([k, v]) => [k, off(f.id, k, v)]),
    ) as typeof a; // the same keys back, each a number: what was read in
    return { ...f, attributes };
  });
  return { ...state, fighters };
}

interface Scored extends Candidate {
  readonly value: number;
}

export function planFor(request: PlanRequest): Planned | undefined {
  const real = request.state.fighters.find((f) => f.id === request.selfId);
  if (!real) return undefined;
  const tier = TIERS[statTier(real.attributes.intellect).grade];
  const view = silent(believed(request.state, request.selfId, tier.blur));
  const self = view.fighters.find((f) => f.id === request.selfId);
  if (!self) return undefined;
  const { candidates, all } = candidatesFor(view, self, tier);
  if (candidates.length === 0) return undefined;
  // As many candidates as one seed each affords, then as many seeds as the budget allows.
  const affordable = candidates.slice(0, Math.max(1, Math.floor(request.budget / HORIZON)));
  const rollouts = Math.max(
    1,
    Math.min(tier.rollouts, Math.floor(request.budget / (affordable.length * HORIZON))),
  );
  const forward = forwardFrom(view, request.selfId, request.seedBase);
  const objective: Objective | undefined = real.objective?.id;
  const score = (c: Candidate): Scored => {
    let total = 0;
    for (let seed = 0; seed < rollouts; seed++) {
      const end = forward.leaf(c.sequence, Math.max(HORIZON, c.sequence.length), seed);
      total += worthOf(view, end, { selfId: request.selfId, objective });
    }
    return { ...c, value: total / rollouts };
  };
  const scored = affordable.map(score);
  const widened = tier.widthOne
    ? widen(scored, all, { score, room: request.budget - forward.played() })
    : [];
  const best = [...scored, ...widened].sort((a, b) => b.value - a.value)[0];
  return best ? { ...best, simulated: forward.played() } : undefined;
}

/** The best first card tried with every follow-up, while the budget lasts. */
function widen(
  scored: readonly Scored[],
  all: readonly CardId[],
  { score, room }: { score: (c: Candidate) => Scored; room: number },
): Scored[] {
  const top = [...scored].sort((a, b) => b.value - a.value)[0]?.sequence[0];
  if (top === undefined || room <= 0) return [];
  const tried = new Set(scored.map((c) => c.sequence.join('|')));
  return all
    .filter((b) => !tried.has(`${top}|${b}`))
    .slice(0, Math.floor(room / HORIZON))
    .map((b) => score({ sequence: [top, b], relies: [[], []] }));
}
