import type { CombatTechnique } from '../../contract';
import { alive, hasPerk } from '../../rules/body';
import { canAttackFrom } from '../../rules/kit';
import { hasVerb, isHindering, isWounding } from '../../rules/verbs';
import { findCard, fitsBand, isOffence, needsAim, playable, type Card } from './cards';
import { improvise } from './choose';
import { partnered } from './combo';
import { ownField } from './field';
import { moveDestination } from './footwork';
import { toolInstinct } from './pouch';
import { hittable } from './rows';
import { inSight, opponentsOf } from './senses';
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
 * `rows.ts`); a slot with none in reach is passed over. A daze, seal or confusion looks for a
 * foe not already held. When no slot qualifies, the player improvises a basic blow or a step.
 * Teammates play their cards this way too (`team.ts`); foes follow their instincts
 * (`choose.ts`).
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
  const seen = foes.filter((f) => inSight(self, f));
  switch (when) {
    case undefined:
      return seen;
    case 'foe-dazed':
      return nonEmpty(seen.filter(dazed));
    case 'foe-readying':
      return nonEmpty(seen.filter((f) => readying(f, round.intents)));
    case 'low-health':
      return self.health < self.maxHealth * LOW_HEALTH ? seen : null;
    case 'low-chakra':
      return self.chakra < self.maxChakra * LOW_CHAKRA ? seen : null;
    case 'foe-hidden':
      return foes.some((f) => f.hidden) ? seen : null;
  }
}

function byHealth(foes: readonly PlanFighter[], most: boolean): PlanFighter | undefined {
  return [...foes].sort((a, b) => (most ? b.health - a.health : a.health - b.health))[0];
}

/** Whom a slot aims at among the foes it may target; the mark, when it's among them. */
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
      return foes.find((f) => f.id === round.mark) ?? byHealth(foes, false);
    case 'weakest':
    case undefined:
      return byHealth(foes, false);
  }
}

/**
 * No healing at full health, no sensing with no one hidden (or foes already read), no hiding
 * twice, no raising a field while yours is up, no move to where you already are, no
 * combination without a partner ready to join it.
 */
function jutsuNeeded(self: PlanFighter, t: CombatTechnique, round: Round): boolean {
  const hiddenFoe = opponentsOf(round.fighters, self).some((f) => f.hidden);
  if (hasVerb(t, 'heal') && self.health >= self.maxHealth) return false;
  if (hasVerb(t, 'sense') && (!hiddenFoe || hasPerk(self, 'insight'))) return false;
  if (hasVerb(t, 'field') && ownField(round.field, self)) return false;
  if (moveDestination(self, t) === round.range) return false;
  if (!partnered(round.fighters, self, t)) return false;
  return !(hasVerb(t, 'conceal') && self.hidden);
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
      return jutsuNeeded(self, card.technique, round);
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

/** A technique that only holds a foe back (daze, seal, confuse), without wounding them. */
function holdsOnly(card: Card): boolean {
  return card.kind === 'jutsu' && isHindering(card.technique) && !isWounding(card.technique);
}

/** Not dazed, sealed or confused. */
function free(foe: PlanFighter): boolean {
  return !dazed(foe) && foe.confused === 0;
}

function fromSlot(self: PlanFighter, round: Round, slot: Slot): Play | null {
  const card = findCard(self, slot.card);
  if (!card || !fitsBand(card, round.range) || !useful(self, card, round)) return null;
  const held = whenHolds(self, round, slot.when);
  // Dazing, sealing or confusing a foe already held is wasted: such a card looks for a fresh one.
  const foes = held && holdsOnly(card) ? held.filter(free) : held;
  if (!foes) return null;
  const inReach = needsAim(card) ? hittable(card, foes, round.fighters) : foes;
  const target = aimAt(inReach, slot.target, self, round);
  return needsAim(card) && !target ? null : { card, target };
}

/** The first slot at this distance that qualifies, else an improvised blow or step (at the mark). */
export function plannedPlay(self: PlanFighter, round: Round): Play {
  for (const slot of self.loadout[round.range]) {
    const play = fromSlot(self, round, slot);
    if (play) return play;
  }
  const card = improvise(self, round.range);
  const seen = opponentsOf(round.fighters, self).filter((f) => inSight(self, f));
  return { card, target: aimAt(hittable(card, seen, round.fighters), 'marked', self, round) };
}
