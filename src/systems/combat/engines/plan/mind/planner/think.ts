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
 * Foes who think ahead (`CombatExperiments.planner`, a rule on trial), and when they do it
 * (`docs/design/combat-ai-plan.md` Part 8, rule 1): a mind plans once a round, as it begins, and
 * announces its plan's steps one exchange at a time; three cheap checks make it plan again
 * mid-round (its next step can't be played, a fact the step relied on didn't come true, or it
 * has no plan). Past its plan's steps it plays as it would have (`intentOf`), which is what the
 * plan was scored with. Foes who don't think announce as they always have.
 */

/** The seeds a mind plans with, from the fight's round and who it is, never the fight's Rng. */
function seedBase(round: number, id: string): number {
  let h = round * 2654435761;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0) % 1_000_000;
}

const tierOf = (f: PlanFighter) => TIERS[statTier(f.attributes.intellect).grade];

/** A held plan's next step, or why there is none: it is spent, or it must be made again. */
type Next = { readonly step: string } | { readonly spent: true } | { readonly replan: true };

/**
 * The cheap checks: a new round, no plan, a next step that can't be played, or a fact it relied
 * on that didn't come true, each mean planning again.
 */
function stepNow(state: PlanState, f: PlanFighter, plan: HeldPlan | undefined): Next {
  if (!plan || state.exchange === 0) return { replan: true };
  const step = plan.steps[plan.next];
  if (step === undefined) return { spent: true };
  if (!intendedCard(f, { [f.id]: step }, bandOf(state, f))) return { replan: true };
  const facts = holdsNow(state, f);
  const relied = plan.relies[plan.next] ?? [];
  return relied.every((fact) => facts.has(fact)) ? { step } : { replan: true };
}

function planned(state: PlanState, f: PlanFighter, budget: number): Announcement | undefined {
  const plan = planFor({ state, selfId: f.id, budget, seedBase: seedBase(state.round, f.id) });
  const first = plan?.sequence[0];
  if (!plan || first === undefined) return undefined;
  const held: HeldPlan = { steps: plan.sequence, next: 1, round: state.round, relies: plan.relies };
  return { card: first, why: 'planned', planned: held };
}

function thought(
  state: PlanState,
  f: PlanFighter,
  { rng, budget }: { rng: Rng; budget: number },
): Announcement {
  const now = stepNow(state, f, f.planned);
  if ('spent' in now) return intentOf(state, f, rng);
  if ('step' in now && f.planned) {
    return {
      card: now.step,
      why: 'plan-step',
      planned: { ...f.planned, next: f.planned.next + 1 },
    };
  }
  return planned(state, f, budget) ?? intentOf(state, f, rng);
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
 * Every foe thinks ahead, in a fight that tries it (`CombatExperiments.planner`); in a bout only
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
