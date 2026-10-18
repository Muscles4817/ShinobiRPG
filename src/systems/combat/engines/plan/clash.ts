import { clamp } from '@/core';

import type { CombatTechnique } from '../../contract';
import { alive, chakraCost } from '../../rules/body';
import { elementMultiplier, matchup } from '../../rules/elements';
import { tell } from '../../rules/telling';
import { driveOf, effectsOf, isWounding, primaryEffect, techniquePower } from '../../rules/verbs';
import { playable, type Card } from './cards';
import { intendedCard } from './intent';
import { plannedPlay } from './priority';
import { canHit } from './rows';
import { inSight, type Turn } from './senses';
import { fighterIn, patch, paying, say, type PlanFighter, type Round } from './state';
import { damage } from './wounding';

/**
 * Clashes: an elemental attack meets one coming the other way. When a technique with an element
 * is aimed at someone who hasn't acted yet this exchange and was about to throw an elemental
 * attack back at its user, they may throw it now to meet it: if they see it and are quick enough. The element that overpowers the other
 * wins (`rules/elements.ts`): the loser's technique is swallowed and the winner's carries on,
 * weakened when it was the answer. Between even elements the stronger technique in the stronger
 * hands wins, weakened by the meeting; two close in strength burst against each other. Answering spends the
 * answerer's turn and chakra.
 */

/** How much of an answering technique carries through to its target after winning a clash. */
export const CLASH_CARRY = 0.6;
/** The chance to answer in time between equals, and how speed moves it. */
const ANSWER_BASE = 0.5;
const ANSWER_PER_SPEED = 0.04;
const ANSWER_MIN = 0.15;
const ANSWER_MAX = 0.85;
/** Between even elements, how much stronger one technique must be to break through the other. */
export const CLASH_EDGE = 1.25;

type JutsuCard = Extract<Card, { kind: 'jutsu' }>;

/** A wounding technique with an element: what can meet another in the air. */
function elemental(card: Card | undefined): card is JutsuCard {
  return (
    card?.kind === 'jutsu' && card.technique.element !== undefined && isWounding(card.technique)
  );
}

/** What the answerer was about to throw at the attacker this exchange, if anything. */
function pendingAt(round: Round, answerer: PlanFighter, attacker: PlanFighter): Card | undefined {
  if (answerer.side === 'enemy') {
    const card = intendedCard(answerer, round.intents, round.range);
    return card && canHit(card, attacker, round.fighters) ? card : undefined;
  }
  const play = plannedPlay(answerer, round);
  return play.target?.id === attacker.id ? play.card : undefined;
}

/** Whether a fighter is free to answer: standing, steady, yet to act, and seeing the attacker. */
function free(round: Round, answerer: PlanFighter, attacker: PlanFighter): boolean {
  if (!alive(answerer) || answerer.stunned > 0) return false;
  return !round.acted?.includes(answerer.id) && inSight(answerer, attacker);
}

/** The chance to get a technique off in time to meet one: quicker than the attacker, likelier. */
export function answerChance(answerer: PlanFighter, attacker: PlanFighter): number {
  const gap = answerer.attributes.speed - attacker.attributes.speed;
  return clamp(ANSWER_BASE + gap * ANSWER_PER_SPEED, ANSWER_MIN, ANSWER_MAX);
}

/** The elemental technique a fighter would meet this attack with, if they can. */
function answerTo(round: Round, answerer: PlanFighter, turn: Turn): JutsuCard | null {
  if (!free(round, answerer, turn.actor)) return null;
  const card = pendingAt(round, answerer, turn.actor);
  if (!elemental(card) || !playable(answerer, card)) return null;
  return turn.rng.chance(answerChance(answerer, turn.actor)) ? card : null;
}

/** The answerer throws their technique: chakra paid, their turn spent. */
function thrown(round: Round, answerer: PlanFighter, answer: CombatTechnique): Round {
  const used = answerer.used ?? [];
  const fighters = patch(round.fighters, answerer.id, {
    ...paying(answerer, chakraCost(answerer, answer)),
    used: used.includes(answer.id) ? used : [...used, answer.id],
  });
  const acted = [...(round.acted ?? []), answerer.id];
  const line = tell('{a} meet{a.s} it with {what}!', { a: answerer, what: answer.name });
  return say({ ...round, fighters, acted }, line);
}

/** The winning answer carries on into the attacker, weakened. */
function carried(round: Round, turn: Turn, answerer: PlanFighter, answer: CombatTechnique): Round {
  const attacker = fighterIn(round, turn.actor.id) ?? turn.actor;
  const actor = fighterIn(round, answerer.id) ?? answerer;
  const aimed = { actor, target: attacker, rng: turn.rng, boost: CLASH_CARRY };
  const wounding = [
    ...effectsOf(answer, 'damage'),
    ...effectsOf(answer, 'area'),
    ...effectsOf(answer, 'break'),
  ];
  return wounding.reduce((now, effect) => damage(now, aimed, { technique: answer, effect }), round);
}

/** How a clash went: the round after it, and whether (and how strongly) the attack carries on. */
export interface Clash {
  readonly round: Round;
  readonly through: boolean;
  /** What the attack keeps of its strength when it carries on weakened. */
  readonly boost?: number;
}

/** How strongly a fighter's technique meets another: its power, their skill, their affinity. */
function weight(user: PlanFighter, t: CombatTechnique): number {
  const drive = driveOf(user, { technique: t, effect: primaryEffect(t) });
  return techniquePower(t) * (drive + 1) * elementMultiplier(t, user.nature);
}

/** Who answered, with what. */
interface Answer {
  readonly answerer: PlanFighter;
  readonly answer: CombatTechnique;
}

/** Between even elements: which side's technique wins, or null when they burst. */
function stronger(turn: Turn, t: CombatTechnique, { answerer, answer }: Answer) {
  const ratio = weight(turn.actor, t) / Math.max(1, weight(answerer, answer));
  if (ratio >= CLASH_EDGE) return 'attack';
  return ratio <= 1 / CLASH_EDGE ? 'answer' : null;
}

/** Even elements: the clearly stronger technique carries on, weakened; else both burst. */
function evenClash(met: Round, turn: Turn, t: CombatTechnique, against: Answer): Clash {
  const { answerer, answer } = against;
  switch (stronger(turn, t, against)) {
    case 'attack':
      return {
        round: say(met, `${t.name} drives through ${answer.name}!`),
        through: true,
        boost: CLASH_CARRY,
      };
    case 'answer': {
      const driven = say(met, `${answer.name} drives through ${t.name}!`);
      return { round: carried(driven, turn, answerer, answer), through: false };
    }
    case null:
      return {
        round: say(met, `${t.name} and ${answer.name} burst against each other.`),
        through: false,
      };
  }
}

/** Meets an elemental attack with the target's own, when they have one ready; else null. */
export function clash(round: Round, turn: Turn, t: CombatTechnique): Clash | null {
  const target = turn.target && fighterIn(round, turn.target.id);
  if (!t.element || !isWounding(t) || !target) return null;
  const answer = answerTo(round, target, turn);
  if (!answer) return null;
  const met = thrown(round, target, answer.technique);
  const theirs = answer.technique;
  switch (matchup(t.element, theirs.element)) {
    case 'strong':
      return { round: say(met, `${t.name} overwhelms ${theirs.name}!`), through: true };
    case 'weak': {
      const swallowed = say(met, `${theirs.name} swallows ${t.name} and keeps coming!`);
      return { round: carried(swallowed, turn, target, theirs), through: false };
    }
    case 'even':
      return evenClash(met, turn, t, { answerer: target, answer: theirs });
  }
}
