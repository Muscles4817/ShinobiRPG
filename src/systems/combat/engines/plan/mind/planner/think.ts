import type { Rng } from '@/core';
import { statTier } from '@/systems/stats';

import { alive } from '../../../../rules/body';
import type { Announcement } from '../../decisionLog';
import { bandOf } from '../../distance';
import { byIntent, intendedCard, intentOf } from '../../intent';
import type { PlanFighter, PlanState } from '../../state';
import type { HeldPlan } from '../shape';
import { holdsNow } from './facts';
import { roundBudget, TIERS } from './ladder';
import { planFor } from './search';

/**
 * Foes who think ahead, and when they do it (`docs/design/combat-ai-plan.md` Part 8): a mind
 * thinks before every exchange, playing its options out in the engine. A plan it already holds
 * (a combination: hide, then strike) is not thrown away for a near tie: its next step is what it
 * would do anyway, kept unless a fresh look beats it clearly (`search.ts`). A step that can no
 * longer be played, or that relied on something that didn't come true, is let go. Foes who
 * don't think announce as they always have (`intentOf`).
 */

/** The seeds a mind plans with, from the fight's exchange and who it is, never the fight's Rng. */
function seedBase(state: PlanState, id: string): number {
  let h = (state.round * 8 + state.exchange) * 2654435761;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0) % 1_000_000;
}

const tierOf = (f: PlanFighter) => TIERS[statTier(f.attributes.intellect).grade];

/** A held plan's next step, while it can still be played and what it relied on came true. */
function heldStep(state: PlanState, f: PlanFighter, plan: HeldPlan | undefined): string | null {
  const step = plan?.steps[plan.next];
  if (!plan || step === undefined) return null;
  if (!intendedCard(f, { [f.id]: step }, bandOf(state, f))) return null;
  const facts = holdsNow(state, f);
  const relied = plan.relies[plan.next] ?? [];
  return relied.every((fact) => facts.has(fact)) ? step : null;
}

function thought(
  state: PlanState,
  f: PlanFighter,
  { rng, budget }: { rng: Rng; budget: number },
): Announcement {
  const step = heldStep(state, f, f.planned);
  const request = { state, selfId: f.id, budget, seedBase: seedBase(state, f.id) };
  const plan = planFor(step === null ? request : { ...request, keep: step });
  const first = plan?.sequence[0];
  if (!plan || first === undefined) return intentOf(state, f, rng);
  // The fresh look kept the step it held: the plan goes on.
  if (f.planned && step !== null && plan.sequence.length === 1 && first === step) {
    return { card: step, why: 'plan-step', planned: { ...f.planned, next: f.planned.next + 1 } };
  }
  const held: HeldPlan = { steps: plan.sequence, next: 1, round: state.round, relies: plan.relies };
  return { card: first, why: 'planned', planned: held };
}

/**
 * What every standing foe (and, in a bout only watched, everyone who thinks) means to do next
 * exchange, thinking fighters by their plans.
 */
export function foresee(state: PlanState, rng: Rng): Readonly<Record<string, Announcement>> {
  const foes = state.fighters.filter((f) => byIntent(f) && alive(f) && f.stunned === 0);
  const thinkers = foes.filter((f) => f.thinks);
  const weights = thinkers.reduce((sum, f) => sum + tierOf(f).weight, 0);
  const budget = roundBudget(state.fighters.filter(alive).length);
  const shareOf = (f: PlanFighter) =>
    Math.max(1, Math.floor((budget * tierOf(f).weight) / Math.max(1, weights)));
  return Object.fromEntries(
    foes.map((f) => [
      f.id,
      f.thinks ? thought(state, f, { rng, budget: shareOf(f) }) : intentOf(state, f, rng),
    ]),
  );
}

/**
 * Every foe thinks ahead, unless a bench keeps everyone to instinct (`CombatSetup.instinct`); in a bout only
 * watched, so does everyone on your side, or the two sides would not be fighting with the same
 * minds. A fight you plan yourself keeps your side to the plans you set.
 */
export function withThinking(
  fighters: readonly PlanFighter[],
  { on, watched }: { on: boolean; watched: boolean },
): PlanFighter[] {
  if (!on) return [...fighters];
  const thinks = (f: PlanFighter) => f.side === 'enemy' || watched;
  return fighters.map((f) => (thinks(f) ? { ...f, thinks: true as const } : f));
}
