import type { Rng } from '@/core';

import type { CombatTechnique, RangeBand } from '../../contract';
import { canAttackFrom, homeBand } from '../../rules/kit';
import { RANGE_BANDS } from '../../rules/range';
import { isTrump, lastDitch, outmatched } from '../../rules/trumps';
import { hasVerb, isHarmful, isHindering, isWounding, techniquePower } from '../../rules/verbs';
import { isOffence, playable, slotted, type Card } from './cards';
import { partnered } from './combo';
import { moveDestination } from './footwork';
import { toolInstinct } from './pouch';
import { prepInstinct } from './prep';
import { sightInstinct } from './sight';
import { canDaze, isDazed, type PlanFighter } from './state';

/**
 * Which slotted card a fighter plays this exchange. Fighters follow a few instincts (heal when
 * hurt, daze a fresh foe, punish a dazed one, keep a trump for the last ditch or a far stronger
 * foe, seal only a foe who fights with jutsu); otherwise they pick among the cards slotted for
 * this distance, stronger ones more often. With nothing playable they improvise a basic blow,
 * or, when their kit can't attack from here, a step towards where it can. A fighter with Search
 * or Dispel slotted uses it first when a foe is hidden (Dispel also when confused); then a
 * slotted tool the moment calls for (see `pouch.ts`). A move technique is footwork, picked like
 * a step when it would take them elsewhere.
 */

const LOW_HEALTH = 0.35;
const DAZE_FIRST_CHANCE = 0.6;
const BASIC_WEIGHT = 5;
const STEP_WEIGHT = 5;

function jutsu(cards: readonly Card[], test: (t: CombatTechnique) => boolean): Card | undefined {
  return cards
    .flatMap((c) => (c.kind === 'jutsu' && test(c.technique) ? [c] : []))
    .sort((a, b) => techniquePower(b.technique) - techniquePower(a.technique))[0];
}

function weight(card: Card): number {
  if (card.kind === 'jutsu') return Math.max(BASIC_WEIGHT, techniquePower(card.technique) / 2);
  return card.kind === 'step' ? STEP_WEIGHT : BASIC_WEIGHT;
}

function weighted(cards: readonly Card[], rng: Rng): Card | undefined {
  const total = cards.reduce((sum, c) => sum + weight(c), 0);
  let roll = rng.next() * total;
  for (const card of cards) {
    roll -= weight(card);
    if (roll < 0) return card;
  }
  return cards[cards.length - 1];
}

/** A basic blow when the kit reaches from here, else a step towards where it does. */
export function improvise(self: PlanFighter, band: RangeBand): Card {
  if (canAttackFrom(self, band)) return band === 'close' ? { kind: 'strike' } : { kind: 'throw' };
  const further = RANGE_BANDS.indexOf(homeBand(self)) > RANGE_BANDS.indexOf(band);
  return { kind: 'step', direction: further ? 'back' : 'in' };
}

/** A move technique that would take them somewhere else: footwork, like a step. */
function flickers(self: PlanFighter, card: Card, band: RangeBand): boolean {
  if (card.kind !== 'jutsu') return false;
  const to = moveDestination(self, card.technique);
  return to !== null && to !== band;
}

function senses(self: PlanFighter, ready: readonly Card[], hiddenFoe: boolean): Card | undefined {
  const search = ready.find((c) => c.kind === 'search');
  if (search && hiddenFoe) return search;
  const dispel = ready.find((c) => c.kind === 'dispel');
  return dispel && (hiddenFoe || self.confused > 0) ? dispel : undefined;
}

/** The situation a fighter acts in. */
export interface Moment {
  readonly band: RangeBand;
  /** The foe they'd attack; undefined when no living foe can be seen. */
  readonly foe: PlanFighter | undefined;
  /** Some living foe is hidden in an illusion. */
  readonly hiddenFoe?: boolean;
  /** The first exchange of a round, when a smoke bomb opens. */
  readonly opening?: boolean;
  /** A field of their own side is already over the fight. */
  readonly fieldUp?: boolean;
  /** Everyone in the fight, when known: a combination technique needs a partner among them. */
  readonly fighters?: readonly PlanFighter[];
  /** The exchange the card would be played in: a foe steady after a daze can't be dazed. */
  readonly exchange?: number;
}

/**
 * A sense, Search or Dispel for a hidden foe, a conceal to open, an empower, clones or a trap
 * (`prep.ts`); else a tool that's called for.
 */
function instinctFor(self: PlanFighter, ready: readonly Card[], moment: Moment): Card | undefined {
  const hiddenFoe = moment.hiddenFoe ?? false;
  const opening = moment.opening ?? false;
  const now = { hiddenFoe, opening };
  return (
    sightInstinct(self, ready, { ...now, fieldUp: moment.fieldUp ?? false }) ??
    senses(self, ready, hiddenFoe) ??
    prepInstinct(self, ready, moment) ??
    toolInstinct(self, ready, now)
  );
}

/** A trump card's moment: badly hurt, or facing a far stronger foe. */
function trumpTime(self: PlanFighter, foe: PlanFighter | undefined): boolean {
  return lastDitch(self) || (foe !== undefined && outmatched(self, [foe]));
}

function trumpCard(card: Card): boolean {
  return card.kind === 'jutsu' && isTrump(card.technique);
}

/** A hold worth putting on this foe: a seal only locks something when they fight with jutsu. */
function holdsBack(foe: PlanFighter | undefined) {
  const usesJutsu = foe === undefined || foe.techniques.some(isHarmful);
  return (t: CombatTechnique) =>
    isHindering(t) && (usesJutsu || hasVerb(t, 'daze') || hasVerb(t, 'confuse'));
}

/** Footwork and attacks that reach from here: what a turn can be spent on. */
function moves(self: PlanFighter, ready: readonly Card[], band: RangeBand): Card[] {
  const reaches = canAttackFrom(self, band);
  return ready.filter(
    (c) => c.kind === 'step' || flickers(self, c, band) || (isOffence(c) && reaches),
  );
}

/**
 * An attack or footwork: a trump (only offered in its moment), a hold on a fresh foe (often), the finisher on
 * a dazed one, else any of them, stronger ones more often.
 */
function onTheMove(self: PlanFighter, harmful: readonly Card[], moment: Moment, rng: Rng): Card {
  const { band, foe } = moment;
  const trump = harmful.find(trumpCard);
  if (trump) return trump;
  const daze = jutsu(harmful, holdsBack(foe));
  const fresh =
    foe !== undefined &&
    canDaze(foe, moment.exchange ?? 0) &&
    foe.sealed === 0 &&
    foe.confused === 0;
  if (daze && fresh && rng.chance(DAZE_FIRST_CHANCE)) return daze;
  const finisher = jutsu(harmful, isWounding);
  if (finisher && foe && isDazed(foe)) return finisher;
  const usual = harmful.filter((c) => c !== daze || fresh);
  return weighted(usual, rng) ?? improvise(self, band);
}

/**
 * Badly hurt with a trump ready here: whatever they announced, the fight has moved on, and the
 * trump comes out now (`intent.ts`).
 */
export function desperate(self: PlanFighter, band: RangeBand): boolean {
  return lastDitch(self) && slotted(self, band).some((c) => trumpCard(c) && playable(self, c));
}

export function chooseCard(self: PlanFighter, moment: Moment, rng: Rng): Card {
  const fighters = moment.fighters ?? [];
  // A trump is held back (from every instinct, an empower's too) until its moment.
  const trumpNow = trumpTime(self, moment.foe);
  const ready = slotted(self, moment.band).filter(
    (c) =>
      playable(self, c) &&
      (trumpNow || !trumpCard(c)) &&
      (c.kind !== 'jutsu' || partnered(fighters, self, c.technique)),
  );
  const instinct = instinctFor(self, ready, moment);
  if (instinct) return instinct;
  const heal = jutsu(ready, (t) => hasVerb(t, 'heal'));
  if (heal && self.health < self.maxHealth * LOW_HEALTH) return heal;
  return onTheMove(self, moves(self, ready, moment.band), moment, rng);
}
