import type { NarrationOffPlan } from '../../rules/narration';
import { alive } from '../../rules/body';
import { hasVerb, isHindering, isPinned, isWounding } from '../../rules/verbs';
import { findCard, fitsBand, isOffence, needsAim, playable, type Card } from './cards';
import { canDaze, isDazed } from './daze';
import { bandOf, distanceBetween } from './distance';
import { RANGE_BANDS } from '../../rules/range';
import { whenHolds } from './conditions';
import { finisherTargets, isOpen, needsOpenTarget } from './finishers';
import { needed } from './needed';
import { spendsReserve } from './pacing';
import { hittable } from './rows';
import { mindsMark } from './sharedMind';
import type { PlanFighter, Round, Slot, TargetRule } from './state';
import { attacksFrom } from './stepping';
import type { PassReason } from './traceShape';
import { bestTarget } from './targeting';

/**
 * One slot of a plan, judged (`priority.ts` plays the first that qualifies): whether its card
 * would do something now, whether its condition holds, and whom it aims at. When it doesn't
 * play, the verdict says why (`SlotVerdict`), for the plan screen's slot trace (audit P1.2).
 */

type Intents = Round['intents'];

/** The card a foe has telegraphed, if any. */
function announced(foe: PlanFighter, intents: Intents): Card | null {
  const id = intents[foe.id];
  return id === undefined ? null : findCard(foe, id);
}

function dazed(foe: PlanFighter): boolean {
  return isDazed(foe) || foe.sealed > 0;
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

function byHealth(foes: readonly PlanFighter[], most: boolean): PlanFighter | undefined {
  return [...foes].sort((a, b) => (most ? b.health - a.health : a.health - b.health))[0];
}

/** The foe standing closest, the weakest of them on a tie. */
function nearest(foes: readonly PlanFighter[], self: PlanFighter, round: Round) {
  const gap = (f: PlanFighter) => RANGE_BANDS.indexOf(distanceBetween(round, self.id, f.id));
  return [...foes].sort((a, b) => gap(a) - gap(b) || a.health - b.health)[0];
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
    case 'nearest':
      return nearest(foes, self, round);
    case 'open':
      return byHealth(nonEmpty(foes.filter(isOpen)) ?? foes, false);
    case undefined:
      // Left to their judgement (foes, teammates), a fighter goes for whoever is most worth it.
      // A body of a mind aims at its side's mark, as one (`sharedMind.ts`).
      if (self.isPlayer) return byHealth(foes, false);
      return mindsMark(self, foes, round) ?? bestTarget(self, foes);
  }
}

/** Why a card wouldn't do anything now, or null when it would. */
function uselessBecause(self: PlanFighter, card: Card, round: Round): PassReason | null {
  if (!playable(self, card)) return 'cannot-use';
  if (spendsReserve(self, card)) return 'saving';
  if (isOffence(card) && !attacksFrom(self, card, bandOf(round, self))) return 'out-of-reach';
  return needed(self, card, round) ? null : 'not-needed';
}

/** Whether a card would do something now: it can be played, it reaches, and it's needed. */
export function useful(self: PlanFighter, card: Card, round: Round): boolean {
  return uselessBecause(self, card, round) === null;
}

/** What the player plays this exchange, and at whom. */
export interface Play {
  readonly card: Card;
  readonly target: PlanFighter | undefined;
  /** Nothing slotted played: why the turn went off the plan (stamped for the player). */
  readonly offPlan?: NarrationOffPlan;
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

/** A slot judged: the play it makes, or why it passes. */
export type SlotVerdict = { readonly plays: Play } | { readonly passed: PassReason };

export function slotVerdict(self: PlanFighter, round: Round, slot: Slot): SlotVerdict {
  const card = findCard(self, slot.card);
  if (!card) return { passed: 'missing' };
  if (!fitsBand(card, bandOf(round, self))) return { passed: 'out-of-reach' };
  const useless = uselessBecause(self, card, round);
  if (useless) return { passed: useless };
  const held = whenHolds(self, round, slot.when);
  if (!held) return { passed: 'condition' };
  // Dazing, sealing or confusing a foe already held is wasted: such a card looks for a fresh one.
  const fresh = holdsOnly(card) ? held.filter((f) => free(f, card, round.number)) : held;
  // A finisher that needs an opening waits for an open foe (`finishers.ts`).
  const foes = finisherTargets(card, fresh);
  if (needsOpenTarget(card) && foes.length === 0) return { passed: 'no-target' };
  const inReach = needsAim(card) ? hittable(card, foes, round.fighters) : foes;
  const target = aimAt(inReach, slot.target, self, round);
  return needsAim(card) && !target ? { passed: 'no-target' } : { plays: { card, target } };
}

/** The play a slot makes now, or null when it passes. */
export function fromSlot(self: PlanFighter, round: Round, slot: Slot): Play | null {
  const verdict = slotVerdict(self, round, slot);
  return 'plays' in verdict ? verdict.plays : null;
}
