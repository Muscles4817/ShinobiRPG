import type { Rng } from '@/core';

import type { CombatResult } from '../../contract';
import { applyGuard, patchFighter, performAction, type DuelAction } from './actions';
import { chooseAiAction } from './ai';
import { CHAKRA_REGEN_PER_ROUND, fleeChance } from './formulas';
import {
  isAlive,
  LOG_LIMIT,
  livingEnemies,
  livingOn,
  playerOf,
  sideOf,
  type DuelState,
  type Fighter,
} from './state';

interface Plan {
  readonly actorId: string;
  readonly action: DuelAction;
  readonly initiative: number;
  /** The enemy the player chose to aim at, if any. */
  readonly targetId?: string;
}

/** The player's move this round. */
export interface PlayerMove {
  readonly action: DuelAction;
  readonly targetId?: string;
}

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

/**
 * The player's side focuses the first enemy still standing. Enemies pick among those standing
 * against them (no roll when it is only the player, so solo fights replay as before).
 */
function targetFor(
  fighters: readonly Fighter[],
  actor: Fighter,
  rng: Rng,
  chosen?: string,
): Fighter | undefined {
  const foes = livingOn(fighters, sideOf(actor) === 'player' ? 'enemy' : 'player');
  const picked = foes.find((f) => f.id === chosen);
  if (picked) return picked;
  if (sideOf(actor) === 'player' || foes.length <= 1) return foes[0];
  return rng.pick(foes);
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
    if (actor.stunned > 0) {
      fighters = patchFighter(fighters, actor.id, { stunned: actor.stunned - 1 });
      log.push(`${actor.name} is dazed and loses their turn.`);
      continue;
    }
    const target = targetFor(fighters, actor, rng, plan.targetId);
    if (!target) continue;
    const result = performAction(fighters, { actor, target }, plan.action, rng);
    fighters = result.fighters;
    log.push(...result.lines);
    const targetAfter = fighters.find((f) => f.id === target.id);
    if (targetAfter && !isAlive(targetAfter)) log.push(`${targetAfter.name} falls!`);
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
