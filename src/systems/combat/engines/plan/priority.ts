import { alive, targetable } from '../../rules/body';
import { canAttackFrom } from '../../rules/kit';
import { hasVerb } from '../../rules/verbs';
import { findCard, fitsBand, isOffence, playable, type Card } from './cards';
import { improvise } from './choose';
import { toolInstinct } from './pouch';
import { hittable } from './rows';
import { opponentsOf } from './senses';
import {
  isDazed,
  type PlanFighter,
  type Round,
  type Slot,
  type SlotCondition,
  type TargetRule,
} from './state';

/**
 * How the player's plan plays: slot order is priority. Each exchange the player plays the
 * first slotted card at this distance that would do something now and whose condition holds,
 * aimed by the slot's target rule. A condition about a foe (dazed, readying a jutsu) also picks
 * whom the card goes for. An attack only aims at foes it can reach past their front row (see
 * `rows.ts`); a slot with none in reach is passed over. When no slot qualifies, the player improvises a basic blow or a step.
 * Foes and allies don't plan this way; they follow their instincts (`choose.ts`).
 */

/** "Below a third of my health." */
const LOW_HEALTH = 1 / 3;
/** "My chakra is low": below a quarter. */
const LOW_CHAKRA = 1 / 4;

type Intents = Round['intents'];

/** The card a foe has telegraphed, if any. */
function announced(foe: PlanFighter, intents: Intents): Card | null {
  const id = intents[foe.id];
  return id === undefined ? null : findCard(foe, id);
}

function dazed(foe: PlanFighter): boolean {
  return isDazed(foe) || foe.sealed > 0;
}

function readying(foe: PlanFighter, intents: Intents): boolean {
  return announced(foe, intents)?.kind === 'jutsu';
}

/**
 * A foe whose telegraphed attack can reach my side's back row; with no one standing there, any
 * foe about to attack.
 */
function threatening(foe: PlanFighter, self: PlanFighter, round: Round): boolean {
  const card = announced(foe, round.intents);
  if (card === null || !isOffence(card)) return false;
  const backRow = round.fighters.filter(
    (f) => f.side === self.side && alive(f) && f.row === 'back',
  );
  return backRow.length === 0 || hittable(card, backRow, round.fighters).length > 0;
}

function nonEmpty(foes: readonly PlanFighter[]): readonly PlanFighter[] | null {
  return foes.length > 0 ? foes : null;
}

/**
 * The foes a slot may aim at when its condition holds, or null when it doesn't. A condition
 * about you leaves every foe in sight to aim at.
 */
function whenHolds(
  self: PlanFighter,
  round: Round,
  when: SlotCondition | undefined,
): readonly PlanFighter[] | null {
  const foes = opponentsOf(round.fighters, self);
  const inSight = foes.filter(targetable);
  switch (when) {
    case undefined:
      return inSight;
    case 'foe-dazed':
      return nonEmpty(inSight.filter(dazed));
    case 'foe-readying':
      return nonEmpty(inSight.filter((f) => readying(f, round.intents)));
    case 'low-health':
      return self.health < self.maxHealth * LOW_HEALTH ? inSight : null;
    case 'low-chakra':
      return self.chakra < self.maxChakra * LOW_CHAKRA ? inSight : null;
    case 'foe-hidden':
      return foes.some((f) => f.hidden) ? inSight : null;
  }
}

function byHealth(foes: readonly PlanFighter[], most: boolean): PlanFighter | undefined {
  return [...foes].sort((a, b) => (most ? b.health - a.health : a.health - b.health))[0];
}

/** Whom a slot aims at among the foes it may target. The team mark doesn't exist yet. */
export function aimAt(
  foes: readonly PlanFighter[],
  rule: TargetRule | undefined,
  self: PlanFighter,
  round: Round,
): PlanFighter | undefined {
  switch (rule) {
    case 'strongest':
      return byHealth(foes, true);
    case 'threat':
      return byHealth(nonEmpty(foes.filter((f) => threatening(f, self, round))) ?? foes, false);
    case 'marked':
    case 'weakest':
    case undefined:
      return byHealth(foes, false);
  }
}

/** Whether a card is needed now: no searching with no one hidden, no healing at full health. */
function needed(self: PlanFighter, card: Card, round: Round): boolean {
  const hiddenFoe = opponentsOf(round.fighters, self).some((f) => f.hidden);
  switch (card.kind) {
    case 'search':
      return hiddenFoe;
    case 'dispel':
      return hiddenFoe || self.confused > 0;
    case 'item':
      return (
        card.item.effect === 'blast' ||
        toolInstinct(self, [card], { hiddenFoe, opening: round.opening ?? false }) !== undefined
      );
    case 'jutsu':
      return !hasVerb(card.technique, 'heal') || self.health < self.maxHealth;
    case 'strike':
    case 'throw':
    case 'step':
    case 'guard':
    case 'dodge':
    case 'counter':
      return true;
  }
}

/** Whether a card would do something now: it can be played, it reaches, and it's needed. */
function useful(self: PlanFighter, card: Card, round: Round): boolean {
  if (!playable(self, card)) return false;
  if (isOffence(card) && !canAttackFrom(self, round.range)) return false;
  return needed(self, card, round);
}

/** What the player plays this exchange, and at whom. */
export interface Play {
  readonly card: Card;
  readonly target: PlanFighter | undefined;
}

function fromSlot(self: PlanFighter, round: Round, slot: Slot): Play | null {
  const card = findCard(self, slot.card);
  if (!card || !fitsBand(card, round.range) || !useful(self, card, round)) return null;
  const foes = whenHolds(self, round, slot.when);
  if (!foes) return null;
  const inReach = isOffence(card) ? hittable(card, foes, round.fighters) : foes;
  const target = aimAt(inReach, slot.target, self, round);
  return isOffence(card) && !target ? null : { card, target };
}

/** The first slot at this distance that qualifies, else an improvised blow or step. */
export function plannedPlay(self: PlanFighter, round: Round): Play {
  for (const slot of self.loadout[round.range]) {
    const play = fromSlot(self, round, slot);
    if (play) return play;
  }
  const card = improvise(self, round.range);
  const inSight = opponentsOf(round.fighters, self).filter(targetable);
  return { card, target: aimAt(hittable(card, inSight, round.fighters), 'weakest', self, round) };
}
