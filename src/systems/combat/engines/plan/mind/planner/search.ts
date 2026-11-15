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
  /** Its worth on each seed: every candidate is played on the same seeds, so they compare pair by pair. */
  readonly values: readonly number[];
}

/**
 * How clearly a plan must beat what the fighter would do anyway before it is played instead: its
 * edge on the same seeds, in standard errors. What they'd do anyway carries the long-run sense the
 * two-exchange look can't see (slot order, what the kit is built around), and the look's few seeds
 * can't tell a near tie from luck (`docs/design/research/planner-foes.md`). A plan worth playing
 * wins by far more than this.
 */
const CLEAR_EDGE = 1.5;
/** With a single seed there's no spread to read: an edge this large in worth is clear. */
const ONE_SEED_EDGE = 20;

/** Whether `best` beats `usual` clearly, seed by seed. */
function clearlyBetter(best: Scored, usual: Scored): boolean {
  const diffs = best.values.map((v, i) => v - (usual.values[i] ?? 0));
  const n = diffs.length;
  const mean = diffs.reduce((s, d) => s + d, 0) / Math.max(1, n);
  if (n < 2) return mean > ONE_SEED_EDGE;
  const variance = diffs.reduce((s, d) => s + (d - mean) ** 2, 0) / (n - 1);
  return mean > CLEAR_EDGE * Math.sqrt(variance / n);
}

/** The best plan, unless what they'd do anyway is about as good. */
function chosen(ranked: readonly Scored[], usual: CardId | undefined): Scored | undefined {
  const best = ranked[0];
  const anyway = ranked.find((c) => c.sequence.length === 1 && c.sequence[0] === usual);
  if (!best || !anyway || best === anyway) return best;
  return clearlyBetter(best, anyway) ? best : anyway;
}

export function planFor(request: PlanRequest): Planned | undefined {
  const real = request.state.fighters.find((f) => f.id === request.selfId);
  if (!real) return undefined;
  const tier = TIERS[statTier(real.attributes.intellect).grade];
  const view = silent(believed(request.state, request.selfId, tier.blur));
  const self = view.fighters.find((f) => f.id === request.selfId);
  if (!self) return undefined;
  const { candidates, all, usual } = candidatesFor(view, self, tier);
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
    const values = Array.from({ length: rollouts }, (_, seed) => {
      const end = forward.leaf(c.sequence, Math.max(HORIZON, c.sequence.length), seed);
      return worthOf(view, end, { selfId: request.selfId, objective });
    });
    return { ...c, values, value: values.reduce((s, v) => s + v, 0) / rollouts };
  };
  const scored = affordable.map(score);
  const widened = tier.widthOne
    ? widen(scored, all, { score, room: request.budget - forward.played() })
    : [];
  const best = chosen(
    [...scored, ...widened].sort((a, b) => b.value - a.value),
    usual,
  );
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
