import { clamp, type Rng } from '@/core';

import type { CombatResult } from '../../contract';
import { alive } from '../../rules/body';
import { searchChance } from '../../rules/conditions';
import { strikeDamage } from '../../rules/damage';
import { revealOnAttack } from '../../rules/items';
import { attackKindOf } from '../../rules/kit';
import { RANGE_LABEL, stepBack, stepIn } from '../../rules/range';
import { afterUsing } from '../../rules/trumps';
import { cardId, isOffence, needsAim, type Card } from './cards';
import { chooseCard } from './choose';
import { fieldAfter, lostInField, ownField } from './field';
import { intendedCard } from './intent';
import { useJutsu } from './jutsu';
import { useTool } from './pouch';
import { canHit, hittable } from './rows';
import { plannedPlay, type Play } from './priority';
import { dispel, inSight, misfires, opponentsOf, search, startOfTurn, type Turn } from './senses';
import { react, type Blow } from './react';
import { intercept } from './team';
import {
  fighterIn,
  LOG_LIMIT,
  patch,
  playerOf,
  say,
  type PlanFighter,
  type PlanState,
  type Round,
  wearOffDaze,
} from './state';

/**
 * One exchange of a planned fight: everyone acts in speed order, playing a card slotted for
 * the current distance (the player by their plan's priorities, see `priority.ts`). Footwork is
 * contested by speed; defences react on their own.
 */

const CHAKRA_REGEN = 2;
const THROW_SCALE = 0.6;
const STEP_BASE = 0.55;
const STEP_PER_SPEED = 0.04;
/** Initiative the side that moved first gets in exchange 1: more than any speed gap. */
const FIRST_MOVER_LEAD = 1000;

/** Foes acting on instinct pick a target at random. */
function targetFor(foes: readonly PlanFighter[], rng: Rng) {
  return foes.length === 0 ? undefined : rng.pick(foes);
}

/**
 * Foes play their telegraphed card, or follow their instincts. They size up a foe in sight;
 * when the card can't reach them past their front row, they turn on one it can reach.
 */
function instinct(round: Round, actor: PlanFighter, rng: Rng): Play {
  const seen = opponentsOf(round.fighters, actor).filter((f) => inSight(actor, f));
  const foe = targetFor(seen, rng);
  const hiddenFoe = opponentsOf(round.fighters, actor).some((f) => f.hidden);
  const moment = {
    band: round.range,
    foe,
    hiddenFoe,
    opening: round.opening ?? false,
    fieldUp: ownField(round.field, actor),
    fighters: round.fighters,
  };
  const card = intendedCard(actor, round.intents, round.range) ?? chooseCard(actor, moment, rng);
  if (!foe || !isOffence(card) || canHit(card, foe, round.fighters)) return { card, target: foe };
  return { card, target: targetFor(hittable(card, seen, round.fighters), rng) };
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
    case 'jutsu': {
      const trumpsUsed = afterUsing(turn.actor, card.technique);
      const marked = { ...round, fighters: patch(round.fighters, turn.actor.id, { trumpsUsed }) };
      return useJutsu(marked, turn, card.technique);
    }
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

/** Nobody in sight to attack: rather than stand idle, look for whoever is hiding. */
function unseen(round: Round, turn: Turn): Round {
  const hiding = opponentsOf(round.fighters, turn.actor).some((f) => f.hidden);
  return hiding ? search(round, turn) : say(round, `${turn.actor.name} can't find a target.`);
}

/**
 * Attacking from smoke or a conceal gives you away, hit or miss. An illusionist stays hidden,
 * unless the one they struck at traces the illusion back (as a Search would find them).
 */
function revealed(round: Round, { actor: before, target, rng }: Turn): Round {
  const actor = fighterIn(round, before.id);
  if (!actor?.hidden) return round;
  if (!revealOnAttack(actor).hidden) {
    return { ...round, fighters: patch(round.fighters, actor.id, { hidden: false }) };
  }
  const victim = target && fighterIn(round, target.id);
  if (!victim || !alive(victim) || !rng.chance(searchChance(victim, actor))) return round;
  return say(
    { ...round, fighters: patch(round.fighters, actor.id, { hidden: false }) },
    `${victim.name} traces the illusion back to ${actor.name}.`,
  );
}

/**
 * Plays a card, unless it's an attack with no one in sight (then they search instead) or
 * confusion or a field that blinds them sends it wide. Tools
 * never misfire and don't give a hidden fighter away; attacks and techniques that hurt do.
 */
function attempt(round: Round, turn: Turn, card: Card): Round {
  const { actor, target, rng } = turn;
  if (needsAim(card) && !target) return unseen(round, turn);
  if (card.kind === 'item' || !isOffence(card)) return play(round, turn, card);
  if (misfires(actor, rng)) {
    const whose = actor.isPlayer ? 'Your senses lie to you.' : `${actor.name}'s senses lie.`;
    return revealed(say(round, `${whose} The attack goes wide.`), turn);
  }
  const lost = lostInField(round, actor, rng);
  if (lost) return revealed(say(round, lost), turn);
  return revealed(play(round, turn, card), turn);
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
  if (actor.joined) {
    const fighters = patch(round.fighters, actor.id, { joined: false });
    return say({ ...round, fighters }, `${actor.name} gathers themself after the combination.`);
  }
  // The player and their teammates play their cards in priority order; foes on instinct.
  const planned = actor.side === 'player' ? plannedPlay(actor, round) : instinct(round, actor, rng);
  const { card } = planned;
  const aim = intercept(round, { actor, target: planned.target, rng }, card);
  const played = attempt(aim.round, { actor, target: aim.target, rng }, card);
  return { ...played, seen: remember(played.seen, actor.id, cardId(card)) };
}

/** Resolves one exchange. */
export function resolveExchange(state: PlanState, rng: Rng): PlanState {
  // Whoever moved first (the fight's opening) acts first in the first exchange.
  const ahead = state.round === 1 ? state.firstMover : undefined;
  const order = state.fighters
    .filter(alive)
    .map((f) => ({
      id: f.id,
      initiative: f.attributes.speed + rng.next() * 4 + (f.side === ahead ? FIRST_MOVER_LEAD : 0),
    }))
    .sort((a, b) => b.initiative - a.initiative);
  const start: Round = {
    number: state.round,
    opening: state.exchange === 0,
    fighters: [...state.fighters],
    range: state.range,
    lines: [`— Exchange ${state.round} —`],
    seen: state.seen,
    intents: state.intents,
    ...(state.field ? { field: state.field } : {}),
    ...(state.mark ? { mark: state.mark } : {}),
  };
  const end = order.reduce((round, { id }) => turn(round, id, rng), start);
  const result = decide(end.fighters);
  const { field, lines: fading } = fieldAfter(end.field, state.round);
  const fighters = end.fighters.map((f) => ({
    ...wearOffDaze(f, state.round),
    sealed: Math.max(0, f.sealed - 1),
    chakra: alive(f) ? Math.min(f.maxChakra, f.chakra + CHAKRA_REGEN) : f.chakra,
  }));
  const { field: _old, ...rest } = state;
  return {
    ...rest,
    round: result ? state.round : state.round + 1,
    exchange: state.exchange + 1,
    fighters,
    range: end.range,
    seen: end.seen,
    log: [...state.log, ...end.lines, ...(result ? [] : fading)].slice(-LOG_LIMIT),
    result,
    ...(field ? { field } : {}),
  };
}
