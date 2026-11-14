import type { Rng } from '@/core';

import type { CombatTechnique, RangeBand } from '../../contract';
import { isTrump, lastDitch, outmatched } from '../../rules/trumps';
import {
  hasVerb,
  isHarmful,
  isHindering,
  isPinned,
  isWounding,
  techniquePower,
} from '../../rules/verbs';
import { isOffence, playable, slotted, type Card } from './cards';
import { partnered } from './combo';
import { spendsReserve } from './pacing';
import { readsInTheMoment } from './judgement';
import { cardWorth } from './worth';
import { moveDestination } from './footwork';
import { toolInstinct } from './pouch';
import { prepInstinct } from './prep';
import { kitCall } from './calling';
import { setupPlay } from './setups';
import { opponentsOf } from './senses';
import { needsOpenTarget, openFoes } from './finishers';
import { shelterInstinct } from './shelter';
import { survivalPlay } from './survival';
import { gatherInstinct } from './resting';
import { sightInstinct } from './sight';
import { attacksFrom, improvise, isEntry, makingFor, readiesTheCharge } from './stepping';
import { canDaze, isDazed } from './daze';
import type { Moment } from './moment';
import type { PlanFighter } from './state';
import { weighted } from './weighing';
import type { InstinctWhy, Odds, Why } from './whyShape';

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
function jutsu(cards: readonly Card[], test: (t: CombatTechnique) => boolean): Card | undefined {
  return cards
    .flatMap((c) => (c.kind === 'jutsu' && test(c.technique) ? [c] : []))
    .sort((a, b) => techniquePower(b.technique) - techniquePower(a.technique))[0];
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

/** A card, and the rule that chose it (`whyShape.ts`). */
export interface Choice {
  readonly card: Card;
  readonly why: Why;
  /** The weighted pick's field (`weighted` only): what was passed over, and how near it came. */
  readonly odds?: readonly Odds[];
}

/**
 * A sense, Search or Dispel for a hidden foe, a killer's answer (a set-up, or playing for
 * time), a summoner's call from the kit (`calling.ts`), a set-up, a conceal to open, an empower, clones or a trap (`prep.ts`); else a tool that's called for.
 */
function instinctFor(
  self: PlanFighter,
  ready: readonly Card[],
  moment: Moment,
): Choice | undefined {
  const hiddenFoe = moment.hiddenFoe ?? false;
  const opening = moment.opening ?? false;
  const now = { hiddenFoe, opening };
  const instincts: readonly (readonly [InstinctWhy, () => Card | undefined])[] = [
    ['sight', () => sightInstinct(self, ready, { ...now, fieldUp: moment.fieldUp ?? false })],
    ['senses', () => senses(self, ready, hiddenFoe)],
    ['killer', () => againstKiller(self, moment)],
    [
      'kit-call',
      () =>
        kitCall(self, {
          fighters: moment.fighters ?? [],
          band: moment.band,
          ...(moment.reads ? { reads: moment.reads } : {}),
          ...(moment.exchange === undefined ? {} : { exchange: moment.exchange }),
        }),
    ],
    ['kit-setup', () => setupCard(self, moment)],
    ['prep', () => prepInstinct(self, ready, moment)],
    ['tool', () => toolInstinct(self, ready, now)],
  ];
  for (const [why, instinct] of instincts) {
    const card = instinct();
    if (card) return { card, why };
  }
  return undefined;
}

/** A set-up from the kit (`setups.ts`): hide, hold, finish. */
function setupCard(self: PlanFighter, moment: Moment): Card | undefined {
  const foes = opponentsOf(moment.fighters ?? [], self);
  return setupPlay(self, { band: moment.band, foes })?.card;
}

/**
 * Against a killer: a set-up, which is its own answer to one; else playing for time
 * (`survival.ts`). A foe sees no one's announced card.
 */
function againstKiller(self: PlanFighter, moment: Moment): Card | undefined {
  const fighters = moment.fighters ?? [];
  const at = { fighters, range: moment.band, intents: {}, number: moment.exchange ?? 0 };
  const survival = survivalPlay(self, at)?.card;
  return survival ? (setupCard(self, moment) ?? survival) : undefined;
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
  return ready.filter(
    (c) =>
      c.kind === 'step' || flickers(self, c, band) || (isOffence(c) && attacksFrom(self, c, band)),
  );
}

/**
 * An attack or footwork: a trump (only offered in its moment), a hold on a fresh foe (often), the finisher on
 * a dazed one, else any of them, stronger ones more often.
 */
function onTheMove(self: PlanFighter, harmful: readonly Card[], moment: Moment, rng: Rng): Choice {
  const { foe } = moment;
  const trump = harmful.find(trumpCard);
  if (trump) return { card: trump, why: 'trump' };
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
    return { card: daze, why: 'daze-first' };
  }
  const finisher = jutsu(harmful, isWounding);
  if (finisher && foe && isDazed(foe)) return { card: finisher, why: 'finisher' };
  const usual = harmful.filter((c) => c !== daze || fresh);
  const picked = weighted(self, usual, rng, moment);
  return picked ? { ...picked, why: 'weighted' } : { card: fallback(self, moment), why: 'nothing' };
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
  return chooseWhy(self, moment, rng).card;
}

/** What instinct plays here, and which instinct chose it (`why.ts`). */
export function chooseWhy(self: PlanFighter, moment: Moment, rng: Rng): Choice {
  const fighters = moment.fighters ?? [];
  // A trump is held back (from every instinct, an empower's too) until its moment.
  const trumpNow = trumpTime(self, moment.foe);
  const ready = slotted(self, moment.band).filter(
    (c) =>
      playable(self, c) &&
      !spendsReserve(self, c) &&
      (trumpNow || !trumpCard(c)) &&
      (!needsOpenTarget(c) || openFoes(self, fighters).length > 0) &&
      (c.kind !== 'jutsu' || partnered(fighters, self, c.technique)),
  );
  const instinct = instinctFor(self, ready, moment);
  if (instinct) return instinct;
  const heal = jutsu(ready, (t) => hasVerb(t, 'heal'));
  if (heal && self.health < self.maxHealth * LOW_HEALTH) return { card: heal, why: 'heal' };
  // Far outclassed, a mind that reads the fight takes cover some turns (`shelter.ts`).
  const shelter = shelterInstinct(self, moment.foe, rng);
  if (shelter) return { card: shelter, why: 'shelter' };
  // Run dry of chakra, a fighter whose attacks need it may gather it back (`gather.ts`).
  const rest = gatherInstinct(self, moment, rng);
  if (rest) return { card: rest, why: 'gather' };
  // Someone fighting at a set distance makes for it before anything but an emergency, going in
  // with an entry when they have one.
  const footwork = isPinned(self) ? null : makingFor(self, moment.band);
  const entry = ready.find(
    (c) => readiesTheCharge(self, c, moment.band) && isEntry(self, c, moment.band),
  );
  if (footwork) return entry ? { card: entry, why: 'entry' } : { card: footwork, why: 'footwork' };
  return onTheMove(self, moves(self, ready, moment.band), moment, rng);
}
