import { CHANGE_UP_AFTER } from '../../rules/familiarity';
import { isPinned } from '../../rules/verbs';
import { cardId, findCard, isOffence, type Card } from './cards';
import { bandOf, distanceBetween } from './distance';
import { beats, seenDefence, walksInto } from './adapt';
import { kitCall } from './calling';
import { nextOpening } from './climbing';
import { setupPlay } from './setups';
import { survivalPlay } from './survival';
import { readsInTheMoment } from './judgement';
import { styleOf } from './reads';
import { hittable } from './rows';
import { improvise, makingFor, readiesTheCharge } from './stepping';
import { inSight, opponentsOf } from './senses';
import { aimAt, fromSlot, useful, type Play } from './slots';
import type { PlanFighter, Round, Slot } from './state';

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
function against(self: PlanFighter, play: Play, round: Round): number {
  const band = play.target ? distanceBetween(round, self.id, play.target.id) : bandOf(round, self);
  const defence = seenDefence(round.reads, play.target, band);
  if (!defence) return 0;
  if (beats(play.card, defence)) return 1;
  return walksInto(play.card, defence) ? -1 : 0;
}

/**
 * A foe's first choice, unless it runs into a defence it has seen you keep: then the first
 * later slot that gets past it, or at least one that doesn't walk into it (`adapt.ts`).
 */
function counterPick(self: PlanFighter, round: Round, first: Play): Play {
  const fares = against(self, first, round);
  if (self.side !== 'enemy' || !readsInTheMoment(self)) return first;
  if (fares === 1 || styleOf(first.card) === null) return first;
  const attacks = self.loadout[bandOf(round, self)].flatMap((slot) => {
    const play = fromSlot(self, round, slot);
    return play && styleOf(play.card) !== null ? [play] : [];
  });
  const beating = attacks.find((p) => against(self, p, round) === 1);
  if (beating) return beating;
  return fares < 0 ? (attacks.find((p) => against(self, p, round) === 0) ?? first) : first;
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
  const others = self.loadout[bandOf(round, self)].filter(
    (s) => s.card !== streak.card && !urgent(s),
  );
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

/** A summoner's call from the kit, now, if it calls for one (`calling.ts`). */
function kitFor(self: PlanFighter, round: Round): Card | undefined {
  return kitCall(self, {
    fighters: round.fighters,
    band: bandOf(round, self),
    ...(round.reads ? { reads: round.reads } : {}),
    exchange: round.number,
  });
}

/**
 * What the kit plays by itself, slot or no slot: a ladder's next step when it is time, a set-up
 * or playing for time against a killer, a summoner's call. Never for the player's own plan,
 * which slots those (`kitSlots.ts`): it is theirs, unless they only watch the fight. Playing
 * for time is never the player's either (`survival.ts`).
 */
function kitPlay(self: PlanFighter, round: Round): Play | null {
  if (self.isPlayer && round.watching !== true) return null;
  const climb = climbing(self, round);
  if (climb) return climb;
  // A set-up from the kit, against a match (`setups.ts`): hide, hold, finish.
  const foes = opponentsOf(round.fighters, self);
  const setup = setupPlay(self, { band: bandOf(round, self), foes });
  // A killer coming: the set-up is its own answer, else play for time (`survival.ts`).
  const survival = survivalPlay(self, round);
  if (survival) return setup ?? survival;
  // Otherwise a summoner fights their own way first: from the kit, Sage Mode and all.
  const called = kitFor(self, round);
  if (called) return { card: called, target: undefined };
  return setup ?? null;
}

/**
 * An emergency slot that holds; else what the kit plays by itself (`kitPlay`, never the
 * player's); else, for someone fighting at a set distance and elsewhere, a step towards it; else the
 * first slot at this distance that qualifies; else an improvised blow or step (at the mark).
 */
export function plannedPlay(self: PlanFighter, round: Round): Play {
  const slots = self.loadout[bandOf(round, self)];
  const emergency = firstPlay(self, round, slots.filter(urgent));
  if (emergency) return emergency;
  const kit = kitPlay(self, round);
  if (kit) return kit;
  const footwork = isPinned(self) ? null : makingFor(self, bandOf(round, self));
  if (footwork) {
    // Ready the charge first: power up or make clones, or go in with an entry.
    const charging = slots.filter((s) => {
      const card = findCard(self, s.card);
      return card !== null && readiesTheCharge(self, card, bandOf(round, self));
    });
    return firstPlay(self, round, charging) ?? { card: footwork, target: undefined };
  }
  const play = firstPlay(self, round, slots);
  if (play) return changeUp(self, round, counterPick(self, round, play));
  const foes = opponentsOf(round.fighters, self);
  const seen = foes.filter((f) => inSight(self, f));
  // With no one to hit and someone hidden, looking for them beats walking about.
  if (seen.length === 0 && foes.some((f) => f.hidden)) {
    return { card: { kind: 'search' }, target: undefined, offPlan: 'looking' };
  }
  const card = improvise(self, bandOf(round, self));
  const target = aimAt(hittable(card, seen, round.fighters), 'marked', self, round);
  return { card, target, offPlan: 'improvised' };
}
