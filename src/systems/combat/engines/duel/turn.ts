import type { Rng } from '@/core';

import { targetable } from '../../rules/body';
import { MISFIRE_CHANCE, rehidesNow, shakeOffChance } from '../../rules/conditions';
import {
  patchFighter,
  performAttack,
  type ActionResult,
  type AttackAction,
  type DuelAction,
} from './actions';
import { backOff, closeIn, dispel, search } from './moves';
import { foesOf, footworkWanted, reachableFoes } from './reach';
import type { Fighter } from './state';

/**
 * One fighter's turn within a round: conditions tick, then they move or act. Fighters the
 * player doesn't control step towards where they can fight before attacking.
 */

export interface TurnPlan {
  readonly action: DuelAction;
  /** The enemy the player chose to aim at, if any. */
  readonly targetId?: string;
}

export interface TurnContext {
  readonly rng: Rng;
  readonly round: number;
}

interface Opening extends ActionResult {
  readonly confused: boolean;
}

function find(fighters: readonly Fighter[], id: string): Fighter {
  const found = fighters.find((f) => f.id === id);
  if (!found) throw new Error(`No fighter "${id}" in this duel`);
  return found;
}

/** Illusionists slip back into hiding now and then; confusion fades or is shaken off. */
function startOfTurn(fighters: readonly Fighter[], actor: Fighter, ctx: TurnContext): Opening {
  const rehides = !actor.hidden && rehidesNow(actor, ctx.round);
  const next = rehides ? patchFighter(fighters, actor.id, { hidden: true }) : fighters;
  const lines = rehides ? [`${actor.name} melts back into the illusion.`] : [];
  if (actor.confused === 0) return { fighters: next, lines, confused: false };
  if (ctx.rng.chance(shakeOffChance(actor))) {
    return {
      fighters: patchFighter(next, actor.id, { confused: 0 }),
      lines: [...lines, `${actor.name} shakes off the confusion.`],
      confused: false,
    };
  }
  return {
    fighters: patchFighter(next, actor.id, { confused: actor.confused - 1 }),
    lines,
    confused: true,
  };
}

function pickTarget(candidates: readonly Fighter[], actor: Fighter, rng: Rng, chosen?: string) {
  const picked = candidates.find((f) => f.id === chosen);
  if (picked) return picked;
  if (actor.side === 'player' || candidates.length <= 1) return candidates[0];
  return rng.pick(candidates);
}

/** Nobody in reach of the attack: close in on a distant foe instead, if there is one. */
function noneInReach(fighters: readonly Fighter[], actor: Fighter, rng: Rng): ActionResult {
  const distant = foesOf(fighters, actor).find((f) => targetable(f) && f.distant);
  if (distant) return closeIn(fighters, actor, distant, rng);
  return { fighters, lines: [`${actor.name} can't reach anyone.`] };
}

function attack(
  fighters: readonly Fighter[],
  actor: Fighter,
  plan: TurnPlan & { readonly action: AttackAction },
  rng: Rng,
): ActionResult {
  const { action } = plan;
  if (action.kind === 'technique' && action.technique.effect === 'heal') {
    return performAttack(fighters, { actor, target: actor }, action, rng);
  }
  const candidates = reachableFoes(fighters, actor, action);
  const target = pickTarget(candidates, actor, rng, plan.targetId);
  if (!target) return noneInReach(fighters, actor, rng);
  return performAttack(fighters, { actor, target }, action, rng);
}

/** The player closes in on the chosen distant foe, or the first one in sight. */
function closeInOnChosen(fighters: readonly Fighter[], actor: Fighter, plan: TurnPlan, rng: Rng) {
  const distant = foesOf(fighters, actor).filter((f) => targetable(f) && f.distant);
  const target = distant.find((f) => f.id === plan.targetId) ?? distant[0];
  if (!target) return { fighters, lines: [`${actor.name} is already toe to toe.`] };
  return closeIn(fighters, actor, target, rng);
}

function act(fighters: readonly Fighter[], actor: Fighter, plan: TurnPlan, rng: Rng) {
  const { action } = plan;
  switch (action.kind) {
    case 'strike':
    case 'technique':
      return attack(fighters, actor, { ...plan, action }, rng);
    case 'guard':
      return { fighters, lines: [`${actor.name} braces and gathers chakra.`] };
    case 'flee':
      return { fighters, lines: [] };
    case 'close-in':
      return closeInOnChosen(fighters, actor, plan, rng);
    case 'search':
      return search(fighters, actor, rng);
    case 'dispel':
      return dispel(fighters, actor, rng);
  }
}

/** Moves the fighter wants to make before they can fight from where they stand. */
function footwork(fighters: readonly Fighter[], actor: Fighter, rng: Rng): ActionResult | null {
  const foes = foesOf(fighters, actor);
  const step = footworkWanted(actor);
  const nearest = foes.find(targetable);
  if (step === 'back-off' && foes.length > 0) return backOff(fighters, actor, foes, rng);
  if (step === 'close-in' && nearest) return closeIn(fighters, actor, nearest, rng);
  return null;
}

function isAttack(action: DuelAction): boolean {
  return action.kind === 'strike' || action.kind === 'technique';
}

function mainAction(
  fighters: readonly Fighter[],
  actor: Fighter,
  plan: TurnPlan,
  ctx: TurnContext & { readonly confused: boolean },
): ActionResult {
  if (!actor.isPlayer)
    return footwork(fighters, actor, ctx.rng) ?? act(fighters, actor, plan, ctx.rng);
  if (ctx.confused && isAttack(plan.action) && ctx.rng.chance(MISFIRE_CHANCE)) {
    return { fighters, lines: ['Your senses lie to you. The attack goes wide.'] };
  }
  return act(fighters, actor, plan, ctx.rng);
}

/** Plays one fighter's turn. */
export function takeTurn(
  fighters: readonly Fighter[],
  actorId: string,
  plan: TurnPlan,
  ctx: TurnContext,
): ActionResult {
  const opening = startOfTurn(fighters, find(fighters, actorId), ctx);
  const actor = find(opening.fighters, actorId);
  if (actor.stunned > 0) {
    return {
      fighters: patchFighter(opening.fighters, actor.id, { stunned: actor.stunned - 1 }),
      lines: [...opening.lines, `${actor.name} is dazed and loses their turn.`],
    };
  }
  const result = mainAction(opening.fighters, actor, plan, { ...ctx, confused: opening.confused });
  return { fighters: result.fighters, lines: [...opening.lines, ...result.lines] };
}
