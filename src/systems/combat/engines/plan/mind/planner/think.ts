import type { Rng } from '@/core';
import { statTier } from '@/systems/stats';

import { alive } from '../../../../rules/body';
import type { Announcement } from '../../decisionLog';
import { bandOf } from '../../distance';
import { cardId } from '../../cards';
import { asRound, intendedCard, intentOf } from '../../intent';
import { plannedPlay } from '../../priority';
import { TEAM_PLANNING } from './team';
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

/** The moves foes would make anyway, presumed for teammates still to settle on theirs. */
function presumed(state: PlanState, foes: readonly PlanFighter[]): Record<string, string> {
  const round = asRound(state);
  return Object.fromEntries(foes.map((f) => [f.id, cardId(plannedPlay(f, round).card)]));
}

/** What every standing foe means to do next exchange, thinking foes by their plans. */
export function foresee(state: PlanState, rng: Rng): Readonly<Record<string, Announcement>> {
  const foes = state.fighters.filter((f) => f.side === 'enemy' && alive(f) && f.stunned === 0);
  const thinkers = foes.filter((f) => f.thinks);
  const weights = thinkers.reduce((sum, f) => sum + tierOf(f).weight, 0);
  const budget = roundBudget(state.fighters.filter(alive).length) * TEAM_PLANNING.budgetScale;
  const lit = thinkers[state.round % Math.max(1, thinkers.length)];
  const shareOf = (f: PlanFighter) =>
    TEAM_PLANNING.spotlight
      ? budget
      : Math.max(1, Math.floor((budget * tierOf(f).weight) / Math.max(1, weights)));
  const settled: Record<string, Announcement> = {};
  let intents = TEAM_PLANNING.sequential
    ? { ...state.intents, ...presumed(state, foes) }
    : state.intents;
  for (const f of foes) {
    const thinks = f.thinks === true && (!TEAM_PLANNING.spotlight || f === lit);
    const told = thinks
      ? thought({ ...state, intents }, f, { rng, budget: shareOf(f) })
      : intentOf(state, f, rng);
    settled[f.id] = told;
    if (TEAM_PLANNING.sequential) intents = { ...intents, [f.id]: told.card };
  }
  return settled;
}

/** Every foe thinks ahead, in a fight that tries it (`CombatExperiments.planner`). */
export function withThinking(fighters: readonly PlanFighter[], on: boolean): PlanFighter[] {
  return on
    ? fighters.map((f) => (f.side === 'enemy' ? { ...f, thinks: true as const } : f))
    : [...fighters];
}
