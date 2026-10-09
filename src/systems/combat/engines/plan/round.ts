import type { Rng } from '@/core';

import type { CombatResult, RangeBand } from '../../contract';
import {
  alive,
  chakraCost,
  healAmount,
  holdTurns,
  resistChance,
  strikeDamage,
  techniqueDamage,
} from '../../rules/body';
import { matchup, matchupLine } from '../../rules/elements';
import { preferredRange, RANGE_LABEL } from '../../rules/range';
import { basicAttack, decideByPlan, execution, tacticById, usable, type Deed } from './tactics';
import { LOG_LIMIT, patch, playerOf, type PlanFighter, type PlanState } from './state';

/**
 * One exchange of a planned fight: everyone acts in speed order, following their plan. The
 * player's trump card replaces their plan for one exchange with an all-out technique.
 */

const CHAKRA_REGEN = 2;
const THROW_SCALE = 0.6;
const TRUMP_SCALE = 1.5;
const AI_EXECUTION = 0.8;

interface Act {
  readonly actor: PlanFighter;
  readonly deed: Deed;
  readonly scale: number;
}

interface Round {
  readonly fighters: PlanFighter[];
  readonly range: RangeBand;
  readonly lines: readonly string[];
}

function opponentsOf(fighters: readonly PlanFighter[], self: PlanFighter): PlanFighter[] {
  return fighters.filter((f) => f.side !== self.side && alive(f));
}

/** The player's side focuses the weakest enemy; enemies pick at random. */
function targetFor(fighters: readonly PlanFighter[], self: PlanFighter, rng: Rng) {
  const foes = opponentsOf(fighters, self);
  if (foes.length === 0) return undefined;
  if (self.side === 'player') return [...foes].sort((a, b) => a.health - b.health)[0];
  return rng.pick(foes);
}

function decide(fighters: readonly PlanFighter[]): CombatResult | null {
  if (!alive(playerOf({ fighters }))) return 'defeat';
  return fighters.some((f) => f.side === 'enemy' && alive(f)) ? null : 'victory';
}

function goalFor(self: PlanFighter, state: PlanState): RangeBand {
  if (self.isPlayer && state.tactic) return tacticById(state.tactic).range;
  return preferredRange(self);
}

function aiRules(goal: RangeBand) {
  return tacticById(goal === 'close' ? 'rush' : 'technician').rules;
}

function wound(fighters: PlanFighter[], target: PlanFighter, raw: number): [PlanFighter[], number] {
  const damage = Math.max(1, Math.round(target.guarding ? raw / 2 : raw));
  return [patch(fighters, target.id, { health: Math.max(0, target.health - damage) }), damage];
}

function techniqueEffect(round: Round, act: Act, target: PlanFighter, rng: Rng): Round {
  const { actor } = act;
  if (act.deed.kind !== 'technique') return round;
  const t = act.deed.technique;
  const paid = patch(round.fighters, actor.id, {
    chakra: Math.max(0, actor.chakra - chakraCost(actor, t)),
    guarding: false,
  });
  const lines = [...round.lines, `${actor.name} uses ${t.name}!`];
  if (t.effect === 'heal') {
    const health = Math.min(actor.maxHealth, actor.health + healAmount(actor, t));
    return {
      ...round,
      fighters: patch(paid, actor.id, { health }),
      lines: [...lines, `${actor.name} recovers ${health - actor.health}.`],
    };
  }
  if (rng.chance(resistChance(actor, target, t)))
    return { ...round, fighters: paid, lines: [...lines, `${target.name} sees it coming.`] };
  if (t.effect === 'stun')
    return {
      ...round,
      fighters: patch(paid, target.id, { stunned: target.stunned + holdTurns(t) }),
      lines: [...lines, `${target.name} is dazed!`],
    };
  if (t.effect === 'seal')
    return {
      ...round,
      fighters: patch(paid, target.id, { sealed: target.sealed + holdTurns(t) + 1 }),
      lines: [...lines, `Seals lock ${target.name}'s chakra!`],
    };
  const [fighters, damage] = wound(
    paid,
    target,
    techniqueDamage(actor, target, t, rng.next()) * act.scale,
  );
  const element = matchupLine(matchup(t.element, target.nature), target.name);
  return {
    ...round,
    fighters,
    lines: [...lines, `${target.name} takes ${damage}.`, ...(element ? [element] : [])],
  };
}

function perform(round: Round, act: Act, rng: Rng): Round {
  const { actor, deed } = act;
  const ready = { ...round, fighters: patch(round.fighters, actor.id, { guarding: false }) };
  const target = targetFor(ready.fighters, actor, rng);
  switch (deed.kind) {
    case 'move':
      return {
        ...ready,
        range: deed.to,
        lines: [
          ...ready.lines,
          `${actor.name} moves to ${RANGE_LABEL[deed.to].toLowerCase()} range.`,
        ],
      };
    case 'guard':
      return {
        ...ready,
        fighters: patch(ready.fighters, actor.id, { guarding: true }),
        lines: [...ready.lines, `${actor.name} braces.`],
      };
    case 'technique':
      return target ? techniqueEffect(ready, act, target, rng) : ready;
    case 'strike':
    case 'throw': {
      if (!target) return ready;
      const scale = (deed.kind === 'throw' ? THROW_SCALE : 1) * act.scale;
      const [fighters, damage] = wound(
        ready.fighters,
        target,
        strikeDamage(actor, target, rng.next()) * scale,
      );
      const verb = deed.kind === 'throw' ? 'throws a kunai at' : 'strikes';
      return {
        ...ready,
        fighters,
        lines: [...ready.lines, `${actor.name} ${verb} ${target.name} for ${damage}.`],
      };
    }
  }
}

/** The player's all-out move: their strongest usable damage technique, or a heavy blow. */
export function trumpDeed(player: PlanFighter, range: RangeBand): Deed {
  const best = usable(player, range).find((t) => t.effect === 'damage');
  return best ? { kind: 'technique', technique: best } : basicAttack(range);
}

function chooseDeed(state: PlanState, round: Round, actor: PlanFighter, rng: Rng): Act {
  const goal = goalFor(actor, state);
  const situation = { range: round.range, goal, foe: targetFor(round.fighters, actor, rng) };
  const rules = actor.isPlayer && state.tactic ? tacticById(state.tactic).rules : aiRules(goal);
  const reliability = actor.isPlayer ? execution(actor) : AI_EXECUTION;
  if (rng.chance(reliability))
    return { actor, deed: decideByPlan(actor, rules, situation), scale: 1 };
  return { actor, deed: basicAttack(round.range), scale: 1 };
}

/** What stays fixed for a whole exchange. */
interface Exchange {
  readonly state: PlanState;
  readonly trump: boolean;
  readonly rng: Rng;
}

function turn({ state, trump, rng }: Exchange, round: Round, actorId: string): Round {
  const actor = round.fighters.find((f) => f.id === actorId);
  if (!actor || !alive(actor) || decide(round.fighters)) return round;
  if (actor.stunned > 0) {
    return {
      ...round,
      fighters: patch(round.fighters, actor.id, { stunned: actor.stunned - 1 }),
      lines: [...round.lines, `${actor.name} is dazed and loses the exchange.`],
    };
  }
  const act =
    trump && actor.isPlayer
      ? { actor, deed: trumpDeed(actor, round.range), scale: TRUMP_SCALE }
      : chooseDeed(state, round, actor, rng);
  const lines =
    trump && actor.isPlayer
      ? [...round.lines, `${actor.name} plays their trump card!`]
      : round.lines;
  return perform({ ...round, lines }, act, rng);
}

/** Resolves one exchange. `trump` makes the player go all out this time. */
export function resolveExchange(state: PlanState, trump: boolean, rng: Rng): PlanState {
  const order = state.fighters
    .filter(alive)
    .map((f) => ({ id: f.id, initiative: f.attributes.speed + rng.next() * 4 }))
    .sort((a, b) => b.initiative - a.initiative);
  const start: Round = {
    fighters: [...state.fighters],
    range: state.range,
    lines: [`— Exchange ${state.round} —`],
  };
  const exchange: Exchange = { state, trump, rng };
  const end = order.reduce((round, { id }) => turn(exchange, round, id), start);
  const result = decide(end.fighters);
  const fighters = end.fighters.map((f) => ({
    ...f,
    sealed: Math.max(0, f.sealed - 1),
    chakra: alive(f) ? Math.min(f.maxChakra, f.chakra + CHAKRA_REGEN) : f.chakra,
  }));
  return {
    ...state,
    round: result ? state.round : state.round + 1,
    fighters,
    range: end.range,
    trumpUsed: state.trumpUsed || trump,
    log: [...state.log, ...end.lines].slice(-LOG_LIMIT),
    result,
  };
}
