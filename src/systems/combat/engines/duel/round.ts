import type { Rng } from '@/core';

import type { CombatResult } from '../../contract';
import { applyGuard } from './actions';
import { chooseAiAction } from './ai';
import { CHAKRA_REGEN_PER_ROUND, fleeChance } from './formulas';
import {
  isAlive,
  LOG_LIMIT,
  livingEnemies,
  livingOn,
  playerOf,
  type DuelState,
  type Fighter,
} from './state';
import { takeTurn, type TurnPlan } from './turn';

interface Plan extends TurnPlan {
  readonly actorId: string;
  readonly initiative: number;
}

/** The player's move this round. */
export type PlayerMove = TurnPlan;

function decideResult(fighters: readonly Fighter[]): CombatResult | null {
  const player = fighters.find((f) => f.isPlayer);
  if (!player || !isAlive(player)) return 'defeat';
  return livingOn(fighters, 'enemy').length > 0 ? null : 'victory';
}

function endOfRound(fighters: readonly Fighter[]): Fighter[] {
  return fighters.map((f) => ({
    ...f,
    guarding: false,
    sealed: Math.max(0, (f.sealed ?? 0) - 1),
    chakra: isAlive(f) ? Math.min(f.maxChakra, f.chakra + CHAKRA_REGEN_PER_ROUND) : f.chakra,
  }));
}

function planRound(state: DuelState, move: PlayerMove, rng: Rng): Plan[] {
  const initiative = (f: Fighter): number => f.attributes.speed + rng.next() * 4;
  const player = playerOf(state);
  const plans: Plan[] = [
    {
      actorId: player.id,
      action: move.action,
      initiative: initiative(player),
      ...(move.targetId === undefined ? {} : { targetId: move.targetId }),
    },
    ...state.fighters
      .filter((f) => !f.isPlayer && isAlive(f))
      .map((f) => ({ actorId: f.id, action: chooseAiAction(f, rng), initiative: initiative(f) })),
  ];
  return plans.sort((a, b) => b.initiative - a.initiative);
}

function tryFlee(state: DuelState, rng: Rng): { escaped: boolean; line: string } {
  const escaped = rng.chance(fleeChance(playerOf(state), livingEnemies(state)));
  return escaped
    ? { escaped, line: 'You vanish in a swirl of leaves and escape!' }
    : { escaped, line: 'You try to slip away, but you are cut off!' };
}

/** Plays out one full round given the player's chosen action. */
export function resolveRound(state: DuelState, move: PlayerMove, rng: Rng): DuelState {
  const playerAction = move.action;
  const log: string[] = [...state.log, `— Round ${state.round} —`];

  if (playerAction.kind === 'flee') {
    const attempt = tryFlee(state, rng);
    log.push(attempt.line);
    if (attempt.escaped) return { ...state, log: log.slice(-LOG_LIMIT), result: 'escaped' };
  }

  const plans = planRound(state, move, rng);
  let fighters: readonly Fighter[] = state.fighters;

  // Guarding takes effect before anyone acts, regardless of speed.
  for (const plan of plans) {
    const actor = fighters.find((f) => f.id === plan.actorId);
    if (actor && plan.action.kind === 'guard') fighters = applyGuard(fighters, actor);
  }

  for (const plan of plans) {
    const actor = fighters.find((f) => f.id === plan.actorId);
    if (!actor || !isAlive(actor) || decideResult(fighters)) continue;
    const turn = takeTurn(fighters, actor.id, plan, { rng, round: state.round });
    fighters = turn.fighters;
    log.push(...turn.lines);
  }

  const outcome = decideResult(fighters);
  return {
    ...state,
    round: outcome ? state.round : state.round + 1,
    fighters: endOfRound(fighters),
    log: log.slice(-LOG_LIMIT),
    result: outcome,
  };
}
