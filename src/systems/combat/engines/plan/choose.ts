import type { Rng } from '@/core';

import type { CombatTechnique, RangeBand } from '../../contract';
import { canAttackFrom } from '../../rules/kit';
import { isTrump, lastDitch, outmatched } from '../../rules/trumps';
import {
  hasVerb,
  isHarmful,
  isHindering,
  isPinned,
  isWounding,
  techniquePower,
} from '../../rules/verbs';
import { repeatWeight } from '../../rules/familiarity';
import { standIn } from './repertoire';
import { beats, seenDefence, walksInto } from './adapt';
import { cardId, isOffence, playable, slotted, type Card } from './cards';
import { partnered } from './combo';
import { spendsReserve } from './pacing';
import { beatsWeight, readsInTheMoment, worthSharpness } from './judgement';
import { cardWorth } from './worth';
import { moveDestination } from './footwork';
import { toolInstinct } from './pouch';
import { prepInstinct } from './prep';
import { shelterInstinct } from './shelter';
import { gatherInstinct } from './resting';
import { sightInstinct } from './sight';
import { improvise, isEntry, makingFor, readiesTheCharge } from './stepping';
import { canDaze, isDazed } from './daze';
import type { DefenceKind, PlanFighter, Reads } from './state';

/**
 * Which slotted card a fighter plays this exchange. Fighters follow a few instincts (heal when
 * hurt, daze a fresh foe, punish a dazed one, keep a trump for the last ditch or a far stronger
 * foe, seal only a foe who fights with jutsu); otherwise they pick among the cards slotted for
 * this distance, stronger ones more often, and, as sharply as their judgement allows, those
 * worth more against this foe (`worth.ts`). One fighting at a set distance makes for it first
 * (`stepping.ts`). With nothing playable they improvise a basic blow,
 * or, when their kit can't attack from here, a step towards where it can. A fighter with Search
 * or Dispel slotted uses it first when a foe is hidden (Dispel also when confused); then a
 * slotted tool the moment calls for (see `pouch.ts`). A move technique is footwork, picked like
 * a step when it would take them elsewhere.
 */

const LOW_HEALTH = 0.35;
const DAZE_FIRST_CHANCE = 0.6;
/** A mind that reckons reaches for a hold first only if it is worth this share of its best attack. */
const DAZE_WORTH_SHARE = 0.5;
const BASIC_WEIGHT = 5;
const STEP_WEIGHT = 5;
/** An attack worth nothing against this foe still keeps this share of the average's pull. */
const WORTH_FLOOR = 0.1;
/** How much likelier an attack that walks into the foe's seen defence is (`judgement.ts` sets the lean towards one that beats it). */
const WALKS_INTO_WEIGHT = 0.5;

/** The defence a fighter has seen its foe keep, and how hard it leans on what beats it. */
interface Lean {
  readonly defence: DefenceKind;
  readonly beatsBy: number;
}

function jutsu(cards: readonly Card[], test: (t: CombatTechnique) => boolean): Card | undefined {
  return cards
    .flatMap((c) => (c.kind === 'jutsu' && test(c.technique) ? [c] : []))
    .sort((a, b) => techniquePower(b.technique) - techniquePower(a.technique))[0];
}

function baseWeight(card: Card): number {
  if (card.kind === 'jutsu') return Math.max(BASIC_WEIGHT, techniquePower(card.technique) / 2);
  return card.kind === 'step' ? STEP_WEIGHT : BASIC_WEIGHT;
}

/** Stronger cards more often; for a foe, ones that get past the defence it has seen more still. */
function weight(card: Card, lean: Lean | undefined, self: PlanFighter, worth = 1): number {
  // A mind that reads the fight reaches less for a technique played turns running.
  const streak = self.streak;
  const leaning = card.kind === 'jutsu' && streak?.card === cardId(card) && readsInTheMoment(self);
  const running = leaning ? streak.turns : 0;
  const base = baseWeight(card) * repeatWeight(running) * worth;
  if (!lean) return base;
  if (beats(card, lean.defence)) return base * lean.beatsBy;
  return walksInto(card, lean.defence) ? base * WALKS_INTO_WEIGHT : base;
}

/**
 * Each attack's lean from what it is worth against the foe (`worth.ts`), against the average
 * attack on offer, as sharply as the fighter's judgement weighs it; 1 for anything else.
 */
function worthLeans(self: PlanFighter, cards: readonly Card[], moment: Moment): number[] {
  const { foe } = moment;
  if (!foe) return cards.map(() => 1);
  const where = { band: moment.band, fighters: moment.fighters ?? [] };
  const worths = cards.map((c) => (isOffence(c) ? cardWorth(self, foe, c, where) : null));
  const counted = worths.filter((w): w is number => w !== null);
  const mean = counted.reduce((sum, w) => sum + w, 0) / Math.max(1, counted.length);
  if (mean <= 0) return cards.map(() => 1);
  const sharp = worthSharpness(self);
  return worths.map((w) => (w === null ? 1 : ((w + WORTH_FLOOR * mean) / mean) ** sharp));
}

function weighted(
  self: PlanFighter,
  cards: readonly Card[],
  rng: Rng,
  moment: Moment,
): Card | undefined {
  const lean = leanOf(self, moment);
  // A strike that plays a style is weighed as the best of its moves (`repertoire.ts`).
  const weighed = cards.map((c) => standIn(self, c));
  const leans = worthLeans(self, weighed, moment);
  const weights = weighed.map((c, i) => weight(c, lean, self, leans[i]));
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = rng.next() * total;
  for (const [i, card] of cards.entries()) {
    roll -= weights[i] ?? 0;
    if (roll < 0) return card;
  }
  return cards[cards.length - 1];
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
  /** What each fighter has been seen to do (`reads.ts`): foes lean on what beats it. */
  readonly reads?: Reads;
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
    (c) =>
      c.kind === 'step' ||
      flickers(self, c, band) ||
      (isOffence(c) && (reaches || isEntry(self, c, band))),
  );
}

/**
 * An attack or footwork: a trump (only offered in its moment), a hold on a fresh foe (often), the finisher on
 * a dazed one, else any of them, stronger ones more often.
 */
function onTheMove(self: PlanFighter, harmful: readonly Card[], moment: Moment, rng: Rng): Card {
  const { foe } = moment;
  const trump = harmful.find(trumpCard);
  if (trump) return trump;
  const daze = jutsu(harmful, holdsBack(foe));
  const fresh =
    foe !== undefined &&
    canDaze(foe, moment.exchange ?? 0) &&
    foe.sealed === 0 &&
    foe.confused === 0;
  if (
    daze &&
    fresh &&
    worthDazing(self, daze, { harmful, moment }) &&
    rng.chance(DAZE_FIRST_CHANCE)
  ) {
    return daze;
  }
  const finisher = jutsu(harmful, isWounding);
  if (finisher && foe && isDazed(foe)) return finisher;
  const usual = harmful.filter((c) => c !== daze || fresh);
  return weighted(self, usual, rng, moment) ?? fallback(self, moment);
}

/**
 * Whether a hold on a fresh foe is worth reaching for first: always, for a mind that doesn't
 * reckon (a dull one keeps the reflex), else only when it is worth a fair share of the best
 * wounding attack on offer (`worth.ts`): an off-art feint a hardy foe shrugs off isn't.
 */
function worthDazing(
  self: PlanFighter,
  daze: Card,
  { harmful, moment }: { harmful: readonly Card[]; moment: Moment },
): boolean {
  const { foe } = moment;
  if (!foe || !readsInTheMoment(self)) return true;
  const where = { band: moment.band, fighters: moment.fighters ?? [] };
  const worthOf = (c: Card) => cardWorth(self, foe, c, where) ?? 0;
  const best = Math.max(0, ...harmful.filter((c) => c !== daze).map(worthOf));
  return worthOf(daze) >= best * DAZE_WORTH_SHARE;
}

/** A foe's lean towards what beats the defence it has seen this one keep here. */
function leanOf(self: PlanFighter, { reads, foe, band }: Moment): Lean | undefined {
  const defence = self.side === 'enemy' ? seenDefence(reads, foe, band) : undefined;
  return defence ? { defence, beatsBy: beatsWeight(self) } : undefined;
}

/** Nothing to play: look for a hidden foe when no one is in sight, else improvise. */
function fallback(self: PlanFighter, { band, foe, hiddenFoe }: Moment): Card {
  return foe === undefined && hiddenFoe === true ? { kind: 'search' } : improvise(self, band);
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
      !spendsReserve(self, c) &&
      (trumpNow || !trumpCard(c)) &&
      (c.kind !== 'jutsu' || partnered(fighters, self, c.technique)),
  );
  const instinct = instinctFor(self, ready, moment);
  if (instinct) return instinct;
  const heal = jutsu(ready, (t) => hasVerb(t, 'heal'));
  if (heal && self.health < self.maxHealth * LOW_HEALTH) return heal;
  // Far outclassed, a mind that reads the fight takes cover some turns (`shelter.ts`).
  const shelter = shelterInstinct(self, moment.foe, rng);
  if (shelter) return shelter;
  // Run dry of chakra, a fighter whose attacks need it may gather it back (`gather.ts`).
  const rest = gatherInstinct(self, moment, rng);
  if (rest) return rest;
  // Someone fighting at a set distance makes for it before anything but an emergency, going in
  // with an entry when they have one.
  const footwork = isPinned(self) ? null : makingFor(self, moment.band);
  const entry = ready.find(
    (c) => readiesTheCharge(self, c, moment.band) && isEntry(self, c, moment.band),
  );
  if (footwork) return entry ?? footwork;
  return onTheMove(self, moves(self, ready, moment.band), moment, rng);
}
