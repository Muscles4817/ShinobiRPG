import { clamp, type Rng } from '@/core';

import type { CombatResult } from '../../contract';
import { alive, strikeDamage, targetable } from '../../rules/body';
import { revealOnAttack } from '../../rules/items';
import { attackKindOf } from '../../rules/kit';
import { RANGE_LABEL, stepBack, stepIn } from '../../rules/range';
import { cardId, isOffence, type Card } from './cards';
import { chooseCard } from './choose';
import { intendedCard } from './intent';
import { useJutsu } from './jutsu';
import { useTool } from './pouch';
import { dispel, misfires, opponentsOf, search, startOfTurn, type Turn } from './senses';
import { react, type Blow } from './react';
import {
  fighterIn,
  LOG_LIMIT,
  patch,
  playerOf,
  say,
  type PlanFighter,
  type PlanState,
  type Round,
} from './state';

/**
 * One exchange of a planned fight: everyone acts in speed order, playing a card slotted for
 * the current distance. Footwork is contested by speed; defences react on their own.
 */

const CHAKRA_REGEN = 2;
const THROW_SCALE = 0.6;
const STEP_BASE = 0.55;
const STEP_PER_SPEED = 0.04;

/** The player's side focuses the weakest enemy; enemies pick at random. Hidden foes are skipped. */
function targetFor(fighters: readonly PlanFighter[], self: PlanFighter, rng: Rng) {
  const foes = opponentsOf(fighters, self).filter(targetable);
  if (foes.length === 0) return undefined;
  if (self.side === 'player') return [...foes].sort((a, b) => a.health - b.health)[0];
  return rng.pick(foes);
}

export function decide(fighters: readonly PlanFighter[]): CombatResult | null {
  if (!alive(playerOf({ fighters }))) return 'defeat';
  return fighters.some((f) => f.side === 'enemy' && alive(f)) ? null : 'victory';
}

function step(round: Round, { actor, target: foe, rng }: Turn, direction: 'in' | 'back') {
  const to = direction === 'in' ? stepIn(round.range) : stepBack(round.range);
  const speedGap = actor.attributes.speed - (foe?.attributes.speed ?? 0);
  const chance = foe ? clamp(STEP_BASE + speedGap * STEP_PER_SPEED, 0.25, 0.85) : 1;
  const where = RANGE_LABEL[to].toLowerCase();
  return rng.chance(chance)
    ? { ...say(round, `${actor.name} moves to ${where} range.`), range: to }
    : say(
        round,
        `${actor.name} tries for ${where} range, but ${foe?.name ?? 'no one'} won't allow it.`,
      );
}

function strike(round: Round, { actor, target, rng }: Turn, thrown: boolean): Round {
  if (!target) return round;
  const blow: Blow = {
    raw: strikeDamage(actor, target, rng.next()) * (thrown ? THROW_SCALE : 1),
    what: thrown ? 'kunai' : 'strike',
    dodgeable: true,
    physical: !thrown,
    kind: attackKindOf(null, thrown),
  };
  return react(round, { attacker: actor, target, blow, rng });
}

function play(round: Round, turn: Turn, card: Card): Round {
  switch (card.kind) {
    case 'step':
      return step(
        round,
        { ...turn, target: turn.target ?? opponentsOf(round.fighters, turn.actor)[0] },
        card.direction,
      );
    case 'search':
      return search(round, turn);
    case 'dispel':
      return dispel(round, turn);
    case 'jutsu':
      return useJutsu(round, turn, card.technique);
    case 'item':
      return useTool(round, turn, card.item);
    case 'strike':
    case 'throw':
      return strike(round, turn, card.kind === 'throw');
    case 'guard':
    case 'dodge':
    case 'counter':
      return round;
  }
}

function remember(seen: Round['seen'], fighterId: string, id: string): Round['seen'] {
  const known = seen[fighterId] ?? [];
  return known.includes(id) ? seen : { ...seen, [fighterId]: [...known, id] };
}

function lostSight(round: Round, actor: PlanFighter): Round {
  const vanished = opponentsOf(round.fighters, actor).some((f) => f.hidden);
  return vanished && actor.side === 'enemy'
    ? say(round, `${actor.name} loses sight of you.`)
    : say(round, `${actor.name} can't find a target.`);
}

/** Attacking from smoke gives you away, hit or miss. */
function revealed(round: Round, actorId: string): Round {
  const actor = fighterIn(round, actorId);
  if (!actor) return round;
  return {
    ...round,
    fighters: patch(round.fighters, actorId, { hidden: revealOnAttack(actor).hidden }),
  };
}

/**
 * Plays a card, unless it's an attack with no one in sight or confusion sends it wide. Tools
 * never misfire and don't give a hidden fighter away; attacks and techniques that hurt do.
 */
function attempt(round: Round, turn: Turn, card: Card): Round {
  const { actor, target, rng } = turn;
  if (isOffence(card) && !target) return lostSight(round, actor);
  if (card.kind === 'item' || !isOffence(card)) return play(round, turn, card);
  if (misfires(actor, rng)) {
    const whose = actor.isPlayer ? 'Your senses lie to you.' : `${actor.name}'s senses lie.`;
    return revealed(say(round, `${whose} The attack goes wide.`), actor.id);
  }
  return revealed(play(round, turn, card), actor.id);
}

function turn(start: Round, actorId: string, rng: Rng): Round {
  const before = start.fighters.find((f) => f.id === actorId);
  if (!before || !alive(before) || decide(start.fighters)) return start;
  const round = startOfTurn(start, before, rng);
  const actor = round.fighters.find((f) => f.id === actorId) ?? before;
  if (actor.stunned > 0) {
    const fighters = patch(round.fighters, actor.id, { stunned: actor.stunned - 1 });
    return say({ ...round, fighters }, `${actor.name} is dazed and loses the exchange.`);
  }
  const target = targetFor(round.fighters, actor, rng);
  const hiddenFoe = opponentsOf(round.fighters, actor).some((f) => f.hidden);
  const moment = { band: round.range, foe: target, hiddenFoe, opening: round.opening ?? false };
  const card = intendedCard(actor, round.intents, round.range) ?? chooseCard(actor, moment, rng);
  const played = attempt(round, { actor, target, rng }, card);
  return { ...played, seen: remember(played.seen, actor.id, cardId(card)) };
}

/** Resolves one exchange. */
export function resolveExchange(state: PlanState, rng: Rng): PlanState {
  const order = state.fighters
    .filter(alive)
    .map((f) => ({ id: f.id, initiative: f.attributes.speed + rng.next() * 4 }))
    .sort((a, b) => b.initiative - a.initiative);
  const start: Round = {
    number: state.round,
    opening: state.exchange === 0,
    fighters: [...state.fighters],
    range: state.range,
    lines: [`— Exchange ${state.round} —`],
    seen: state.seen,
    intents: state.intents,
  };
  const end = order.reduce((round, { id }) => turn(round, id, rng), start);
  const result = decide(end.fighters);
  const fighters = end.fighters.map((f) => ({
    ...f,
    sealed: Math.max(0, f.sealed - 1),
    chakra: alive(f) ? Math.min(f.maxChakra, f.chakra + CHAKRA_REGEN) : f.chakra,
  }));
  return {
    ...state,
    round: result ? state.round : state.round + 1,
    exchange: state.exchange + 1,
    fighters,
    range: end.range,
    seen: end.seen,
    log: [...state.log, ...end.lines].slice(-LOG_LIMIT),
    result,
  };
}
