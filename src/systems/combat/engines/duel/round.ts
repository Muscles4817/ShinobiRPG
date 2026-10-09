import type { Rng } from '@/core';

import type { CombatResult } from '../../contract';
import { applyGuard, patchFighter, performAction, type DuelAction } from './actions';
import { chooseEnemyAction } from './ai';
import { CHAKRA_REGEN_PER_ROUND, fleeChance } from './formulas';
import { isAlive, LOG_LIMIT, livingEnemies, playerOf, type DuelState, type Fighter } from './state';

interface Plan {
  readonly actorId: string;
  readonly action: DuelAction;
  readonly initiative: number;
}

function decideResult(fighters: readonly Fighter[]): CombatResult | null {
  const player = fighters.find((f) => f.isPlayer);
  if (!player || !isAlive(player)) return 'defeat';
  return fighters.some((f) => !f.isPlayer && isAlive(f)) ? null : 'victory';
}

function endOfRound(fighters: readonly Fighter[]): Fighter[] {
  return fighters.map((f) => ({
    ...f,
    guarding: false,
    sealed: Math.max(0, (f.sealed ?? 0) - 1),
    chakra: isAlive(f) ? Math.min(f.maxChakra, f.chakra + CHAKRA_REGEN_PER_ROUND) : f.chakra,
  }));
}

function planRound(state: DuelState, playerAction: DuelAction, rng: Rng): Plan[] {
  const initiative = (f: Fighter): number => f.attributes.speed + rng.next() * 4;
  const player = playerOf(state);
  const plans: Plan[] = [
    { actorId: player.id, action: playerAction, initiative: initiative(player) },
    ...livingEnemies(state).map((e) => ({
      actorId: e.id,
      action: chooseEnemyAction(e, rng),
      initiative: initiative(e),
    })),
  ];
  return plans.sort((a, b) => b.initiative - a.initiative);
}

function targetFor(fighters: readonly Fighter[], actor: Fighter): Fighter | undefined {
  return actor.isPlayer
    ? fighters.find((f) => !f.isPlayer && isAlive(f))
    : fighters.find((f) => f.isPlayer);
}

function tryFlee(state: DuelState, rng: Rng): { escaped: boolean; line: string } {
  const escaped = rng.chance(fleeChance(playerOf(state), livingEnemies(state)));
  return escaped
    ? { escaped, line: 'You vanish in a swirl of leaves and escape!' }
    : { escaped, line: 'You try to slip away, but you are cut off!' };
}

/** Plays out one full round given the player's chosen action. */
export function resolveRound(state: DuelState, playerAction: DuelAction, rng: Rng): DuelState {
  const log: string[] = [...state.log, `— Round ${state.round} —`];

  if (playerAction.kind === 'flee') {
    const attempt = tryFlee(state, rng);
    log.push(attempt.line);
    if (attempt.escaped) return { ...state, log: log.slice(-LOG_LIMIT), result: 'escaped' };
  }

  const plans = planRound(state, playerAction, rng);
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
    const target = targetFor(fighters, actor);
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
