import type { CombatTechnique, RangeBand } from '../../contract';
import { alive, hasPerk } from '../../rules/body';
import { effectsOf, hasVerb, isHindering, isPinned, isWounding, opensOf } from '../../rules/verbs';
import {
  cardId,
  findCard,
  fitsBand,
  isDefenceCard,
  isOffence,
  needsAim,
  playable,
  type Card,
} from './cards';
import { CHANGE_UP_AFTER } from '../../rules/familiarity';
import { beats, seenDefence, walksInto } from './adapt';
import { partnered } from './combo';
import { spendsReserve } from './pacing';
import { bestTarget } from './targeting';
import { finisherTargets, needsOpenTarget } from './finishers';
import { kitCall } from './calling';
import { nextOpening } from './climbing';
import { setupPlay } from './setups';
import { survivalPlay } from './survival';
import { readsInTheMoment } from './judgement';
import { styleOf } from './reads';
import { ownField } from './field';
import { moveDestination } from './footwork';
import { toolInstinct } from './pouch';
import { prepNeeded } from './prep';
import { hittable } from './rows';
import { attacksFrom, improvise, makingFor, readiesTheCharge } from './stepping';
import { inSight, opponentsOf } from './senses';
import { canDaze, isDazed } from './daze';
import {
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
 * foe not already held. Someone fighting at a set distance steps towards it first (after an
 * emergency slot). When no slot qualifies, the player improvises a basic blow or a step.
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
    case 'marked': {
      const mark = self.side === 'enemy' ? round.foeMark : round.mark;
      return foes.find((f) => f.id === mark) ?? byHealth(foes, false);
    }
    case 'weakest':
      return byHealth(foes, false);
    case undefined:
      // Left to their judgement (foes, teammates), a fighter goes for whoever is most worth it.
      return self.isPlayer ? byHealth(foes, false) : bestTarget(self, foes);
  }
}

/**
 * No healing at full health, no sensing with no one hidden (or foes already read), no hiding
 * twice, no raising a field while yours is up, no move to where you already are, no
 * combination without a partner ready to join it, no riposte while one is ready, no throw
 * that only moves a foe to where they already are.
 */
/** Where a technique's throw or pull leaves the distance, if it has one. */
function knockTo(t: CombatTechnique): RangeBand | undefined {
  return effectsOf(t, 'knock')[0]?.to;
}

/** A riposte while one is ready, or a throw that only moves a foe to where they are. */
function wasted(self: PlanFighter, t: CombatTechnique, round: Round): boolean {
  if (hasVerb(t, 'counter') && self.riposte) return true;
  return !isWounding(t) && knockTo(t) === round.range;
}

function jutsuNeeded(self: PlanFighter, t: CombatTechnique, round: Round): boolean {
  const hiddenFoe = opponentsOf(round.fighters, self).some((f) => f.hidden);
  if (wasted(self, t, round)) return false;
  // A gate that also heals is opened for the gate, not the healing.
  if (hasVerb(t, 'heal') && !opensOf(t) && self.health >= self.maxHealth) return false;
  if (hasVerb(t, 'sense') && (!hiddenFoe || hasPerk(self, 'insight'))) return false;
  if (hasVerb(t, 'field') && ownField(round.field, self)) return false;
  if (moveDestination(self, t) === round.range) return false;
  if (!partnered(round.fighters, self, t)) return false;
  const foes = opponentsOf(round.fighters, self);
  const foeInSight = foes.some((f) => inSight(self, f));
  const facing = {
    foeInSight,
    foes,
    exchange: round.number,
    ...(round.reads ? { reads: round.reads } : {}),
  };
  if (!prepNeeded(self, t, facing)) return false;
  return !(hasVerb(t, 'conceal') && self.hidden);
}

/**
 * Whether a card is needed now: no searching with no one hidden, no healing at full health, no
 * getting ready twice over or with no foe in sight (`prep.ts`). A foe's announced card is held
 * to it too, at its turn (`round.ts`).
 */
export function needed(self: PlanFighter, card: Card, round: Round): boolean {
  if (isDefenceCard(card)) return true;
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
    case 'gather':
      return true;
  }
}

/** Whether a card would do something now: it can be played, it reaches, and it's needed. */
function useful(self: PlanFighter, card: Card, round: Round): boolean {
  if (!playable(self, card) || spendsReserve(self, card)) return false;
  if (isOffence(card) && !attacksFrom(self, card, round.range)) return false;
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

/** Not dazed, sealed or confused; for a daze, not steady after one; for a pin, not pinned. */
function free(foe: PlanFighter, card: Card, exchange: number): boolean {
  const has = (verb: 'daze' | 'pin') => card.kind === 'jutsu' && hasVerb(card.technique, verb);
  const steady = has('daze') && !canDaze(foe, exchange);
  const held = has('pin') && isPinned(foe);
  return !dazed(foe) && foe.confused === 0 && !steady && !held;
}

function fromSlot(self: PlanFighter, round: Round, slot: Slot): Play | null {
  const card = findCard(self, slot.card);
  if (!card || !fitsBand(card, round.range) || !useful(self, card, round)) return null;
  const held = whenHolds(self, round, slot.when);
  // Dazing, sealing or confusing a foe already held is wasted: such a card looks for a fresh one.
  const fresh = held && holdsOnly(card) ? held.filter((f) => free(f, card, round.number)) : held;
  // A finisher that needs an opening waits for an open foe (`finishers.ts`).
  const foes = fresh && finisherTargets(card, fresh);
  if (!foes || (needsOpenTarget(card) && foes.length === 0)) return null;
  const inReach = needsAim(card) ? hittable(card, foes, round.fighters) : foes;
  const target = aimAt(inReach, slot.target, self, round);
  return needsAim(card) && !target ? null : { card, target };
}

/** Slots that answer an emergency: healing when badly hurt, finding a hidden foe. */
function urgent(slot: Slot): boolean {
  return slot.when === 'low-health' || slot.when === 'foe-hidden';
}

function firstPlay(self: PlanFighter, round: Round, slots: readonly Slot[]): Play | null {
  for (const slot of slots) {
    const play = fromSlot(self, round, slot);
    if (play) return play;
  }
  return null;
}

/** How a play fares against the defence its target has shown: 1 beats it, -1 walks into it. */
function against(play: Play, round: Round): number {
  const defence = seenDefence(round.reads, play.target, round.range);
  if (!defence) return 0;
  if (beats(play.card, defence)) return 1;
  return walksInto(play.card, defence) ? -1 : 0;
}

/**
 * A foe's first choice, unless it runs into a defence it has seen you keep: then the first
 * later slot that gets past it, or at least one that doesn't walk into it (`adapt.ts`).
 */
function counterPick(self: PlanFighter, round: Round, first: Play): Play {
  const fares = against(first, round);
  if (self.side !== 'enemy' || !readsInTheMoment(self)) return first;
  if (fares === 1 || styleOf(first.card) === null) return first;
  const attacks = self.loadout[round.range].flatMap((slot) => {
    const play = fromSlot(self, round, slot);
    return play && styleOf(play.card) !== null ? [play] : [];
  });
  const beating = attacks.find((p) => against(p, round) === 1);
  if (beating) return beating;
  return fares < 0 ? (attacks.find((p) => against(p, round) === 0) ?? first) : first;
}

/**
 * Someone who reads the fight changes up an attack they've played turns running, before their
 * foes have it read (`rules/familiarity.ts`): the next attack in their plan that qualifies.
 */
function changeUp(self: PlanFighter, round: Round, play: Play): Play {
  const streak = self.streak;
  const leaning = streak !== undefined && streak.turns >= CHANGE_UP_AFTER;
  // Only worth it against a foe who'd pick up on the pattern (`rules/familiarity.ts`).
  const read = play.target !== undefined && readsInTheMoment(play.target);
  // The player's own plan is theirs to vary, unless the fight is only watched.
  const planned = self.isPlayer && round.watching !== true;
  if (
    !leaning ||
    !read ||
    planned ||
    !readsInTheMoment(self) ||
    cardId(play.card) !== streak.card
  ) {
    return play;
  }
  const others = self.loadout[round.range].filter((s) => s.card !== streak.card && !urgent(s));
  const other = firstPlay(self, round, others);
  return other && isOffence(other.card) ? other : play;
}

/**
 * A ladder's next step from the kit, which takes no slot (`climbing.ts`), when the fight calls
 * for it (`prep.ts` judges it like any readying).
 */
function climbing(self: PlanFighter, round: Round): Play | null {
  const opening = nextOpening(self);
  if (!opening) return null;
  const card: Card = { kind: 'jutsu', technique: opening };
  return useful(self, card, round) ? { card, target: undefined } : null;
}

/**
 * An emergency slot that holds; else a ladder's next step when it is time; else a set-up, or
 * playing for time against a killer; else a summoner's call from the kit; else, for someone fighting at a set distance and elsewhere, a
 * step towards it; else the first slot at this distance that qualifies; else an improvised
 * blow or step (at the mark).
 */
export function plannedPlay(self: PlanFighter, round: Round): Play {
  const slots = self.loadout[round.range];
  const emergency = firstPlay(self, round, slots.filter(urgent));
  if (emergency) return emergency;
  const climb = climbing(self, round);
  if (climb) return climb;
  // A set-up from the kit, against a match (`setups.ts`): hide, hold, finish.
  const setup = setupPlay(self, { band: round.range, foes: opponentsOf(round.fighters, self) });
  // A killer coming: the set-up is its own answer, else play for time (`survival.ts`).
  const survival = survivalPlay(self, round);
  if (survival) return setup ?? survival;
  // Otherwise a summoner fights their own way first: from the kit, Sage Mode and all.
  const called = kitCall(self, {
    fighters: round.fighters,
    band: round.range,
    ...(round.reads ? { reads: round.reads } : {}),
    exchange: round.number,
  });
  if (called) return { card: called, target: undefined };
  if (setup) return setup;
  const footwork = isPinned(self) ? null : makingFor(self, round.range);
  if (footwork) {
    // Ready the charge first: power up or make clones, or go in with an entry.
    const charging = slots.filter((s) => {
      const card = findCard(self, s.card);
      return card !== null && readiesTheCharge(self, card, round.range);
    });
    return firstPlay(self, round, charging) ?? { card: footwork, target: undefined };
  }
  const play = firstPlay(self, round, slots);
  if (play) return changeUp(self, round, counterPick(self, round, play));
  const foes = opponentsOf(round.fighters, self);
  const seen = foes.filter((f) => inSight(self, f));
  // With no one to hit and someone hidden, looking for them beats walking about.
  if (seen.length === 0 && foes.some((f) => f.hidden)) {
    return { card: { kind: 'search' }, target: undefined };
  }
  const card = improvise(self, round.range);
  return { card, target: aimAt(hittable(card, seen, round.fighters), 'marked', self, round) };
}
