import { createRng } from '@/core';
import { createPlanEngine, type CombatState, type Decision } from '@/systems/combat';
import {
  cardId,
  findCard,
  fitsBand,
  isOffence,
  kitCards,
  playable,
  type Card,
} from '@/systems/combat/engines/plan/cards';
import { bandOf } from '@/systems/combat/engines/plan/distance';
import { asRound } from '@/systems/combat/engines/plan/intent';
import { assess } from '@/systems/combat/engines/plan/mind';
import { opponentsOf } from '@/systems/combat/engines/plan/senses';
import { decode, type PlanFighter, type PlanState } from '@/systems/combat/engines/plan/state';
import { cardWorth } from '@/systems/combat/engines/plan/worth';
import { hasVerb, isHindering, isWounding } from '@/systems/combat/rules/verbs';

import { toSetup } from '../../src/test/bench/fighters';
import { castMember, type CastId } from '../../src/test/bench/matrixCast';
import { forcedFor, playExchange } from '../combat-planner/forward';

/**
 * Who was right where the objective layer and today's AI disagree? At each moment of a watched
 * fight where they part, the fight is copied and played out twice from there with the same seeds
 * (common random numbers): once as today's AI plays it, once with the layer's move forced for
 * that exchange and today's AI after it. The difference in outcome is the worth of the layer's
 * call, measured in the real engine.
 */

export const KINDS = ['recover', 'find', 'stay', 'set-up'] as const;
export type Kind = (typeof KINDS)[number];

const CAP = 80;
const SELF = 'player';

export interface Moment {
  readonly kind: Kind;
  readonly state: PlanState;
  /** What the layer would have played instead. */
  readonly card: string;
}

const t = (c: Card) => (c.kind === 'jutsu' ? c.technique : undefined);

function readyHere(self: PlanFighter, band: PlanState['range']): Card[] {
  return kitCards(self, band).filter((c) => playable(self, c) && fitsBand(c, band));
}

/** The best attack here by what it is worth against the nearest foe. */
function bestAttack(state: PlanState, self: PlanFighter): Card | undefined {
  const band = bandOf(state, self);
  const foe = opponentsOf(state.fighters, self)[0];
  if (!foe) return undefined;
  const attacks = readyHere(self, band).filter(
    (c) => isOffence(c) && (t(c) === undefined || isWounding(t(c)!)),
  );
  const where = { band, fighters: state.fighters };
  return attacks.sort(
    (a, b) => (cardWorth(self, foe, b, where) ?? 0) - (cardWorth(self, foe, a, where) ?? 0),
  )[0];
}

function setUpCard(state: PlanState, self: PlanFighter): Card | undefined {
  return readyHere(self, bandOf(state, self)).find((c) => {
    const tech = t(c);
    return (
      tech !== undefined && ((isHindering(tech) && !isWounding(tech)) || hasVerb(tech, 'conceal'))
    );
  });
}

/** Whether, and how, today's move parts from the layer's objective here. */
function parting(state: PlanState, d: Decision): Moment | undefined {
  const self = state.fighters.find((f) => f.id === SELF);
  if (!self) return undefined;
  const today = findCard(self, d.card);
  if (!today) return undefined;
  const isStep = today.kind === 'step' || (t(today) !== undefined && hasVerb(t(today)!, 'move'));
  const attacks = isOffence(today) && (t(today) === undefined || isWounding(t(today)!));
  if (d.objective === 'recover' && today.kind !== 'gather')
    return { kind: 'recover', state, card: 'gather' };
  if (d.objective === 'find' && today.kind !== 'search' && today.kind !== 'dispel') {
    return { kind: 'find', state, card: 'search' };
  }
  const a = assess(self, asRound(state));
  if (isStep && a.atHome && d.objective !== 'control-distance') {
    const attack = bestAttack(state, self);
    return attack ? { kind: 'stay', state, card: cardId(attack) } : undefined;
  }
  if (attacks && a.canSetUp) {
    const setUp = setUpCard(state, self);
    return setUp ? { kind: 'set-up', state, card: cardId(setUp) } : undefined;
  }
  return undefined;
}

/** Every moment a watched, traced fight parts from the layer, with the fight as it stood. */
export function partings(a: CastId, b: CastId, seed: number): Moment[] {
  const engine = createPlanEngine();
  const rng = createRng(seed);
  let state: CombatState = engine.start(
    {
      player: toSetup(castMember(a, 'chunin'), SELF),
      allies: [],
      enemies: [toSetup(castMember(b, 'chunin'), 'foe')],
      canFlee: false,
      watch: true,
      trace: true,
    },
    rng,
  );
  const before: PlanState[] = [decode(state)];
  for (let n = 0; n < CAP && !engine.outcome(state); n++) {
    const next = engine.act(state, { optionId: 'next' }, rng);
    if (!next.ok) break;
    state = next.value;
    before.push(decode(state));
  }
  const decisions = decode(state).decisions ?? [];
  return decisions.flatMap((d) => {
    if (d.phase !== 'turn' || d.fighterId !== SELF) return [];
    const at = before.find((s) => s.round === d.round && !s.result);
    const moment = at ? parting(at, d) : undefined;
    return moment ? [moment] : [];
  });
}

/** How a played-out fight ended for the fighter: won, and health share ahead of the foe. */
export interface Ending {
  readonly won: number;
  readonly margin: number;
  /** Whether the forced card was the one played (always for today's branch). */
  readonly complied: boolean;
}

function ending(state: PlanState): Pick<Ending, 'won' | 'margin'> {
  const self = state.fighters.find((f) => f.id === SELF)!;
  const foe = state.fighters.find((f) => f.id === 'foe')!;
  const theirs = Math.max(0, foe.health) / foe.maxHealth;
  const won = state.result === 'victory' ? 1 : state.result === 'defeat' ? 0 : 0.5;
  return { won, margin: Math.max(0, self.health) / self.maxHealth - theirs };
}

function withoutKeepAt(state: PlanState): PlanState {
  return {
    ...state,
    fighters: state.fighters.map((f) => {
      if (f.id !== SELF) return f;
      const { keepAt: _set, ...free } = f;
      return free;
    }),
  };
}

function withKeepAt(state: PlanState, from: PlanState): PlanState {
  const keepAt = from.fighters.find((f) => f.id === SELF)?.keepAt;
  return {
    ...state,
    fighters: state.fighters.map((f) => (f.id === SELF && keepAt ? { ...f, keepAt } : f)),
  };
}

/** Plays a moment out from where it stood: today's move, or the layer's forced for one exchange. */
export function playOut(moment: Moment, forced: boolean, seed: number): Ending {
  let state: PlanState = { ...moment.state, decisions: [] };
  // A set distance steps before any slot plays (`stepping.ts`): the forced move goes first.
  const first = forced ? withoutKeepAt(forcedFor(state, SELF, moment.card)) : state;
  state = playExchange(first, seed * 7919);
  const played = state.decisions?.find((d) => d.phase === 'turn' && d.fighterId === SELF)?.card;
  state = forced ? withKeepAt(forcedFor(state, SELF, null, moment.state), moment.state) : state;
  for (let i = 1; i < CAP && !state.result; i++) state = playExchange(state, seed * 7919 + i);
  return { ...ending(state), complied: !forced || played === moment.card };
}
