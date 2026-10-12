import type { Rng } from '@/core';

import type { CombatTechnique, RangeBand } from '../../contract';
import { canAttackFrom, homeBand } from '../../rules/kit';
import { RANGE_BANDS } from '../../rules/range';
import { hasVerb, isHindering, isWounding, techniquePower } from '../../rules/verbs';
import { isOffence, playable, slotted, type Card } from './cards';
import { moveDestination } from './footwork';
import { toolInstinct } from './pouch';
import { prepInstinct } from './prep';
import { sightInstinct } from './sight';
import { isDazed, type PlanFighter } from './state';

/**
 * Which slotted card a fighter plays this exchange. Fighters follow a few instincts (heal when
 * hurt, daze a fresh foe, punish a dazed one); otherwise they pick among the cards slotted for
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

export function chooseCard(self: PlanFighter, moment: Moment, rng: Rng): Card {
  const { band, foe } = moment;
  const ready = slotted(self, band).filter((c) => playable(self, c));
  const instinct = instinctFor(self, ready, moment);
  if (instinct) return instinct;
  const heal = jutsu(ready, (t) => hasVerb(t, 'heal'));
  if (heal && self.health < self.maxHealth * LOW_HEALTH) return heal;
  const reaches = canAttackFrom(self, band);
  const harmful = ready.filter(
    (c) => c.kind === 'step' || flickers(self, c, band) || (isOffence(c) && reaches),
  );
  const daze = jutsu(harmful, isHindering);
  const fresh = foe !== undefined && !isDazed(foe) && foe.sealed === 0 && foe.confused === 0;
  if (daze && fresh && rng.chance(DAZE_FIRST_CHANCE)) return daze;
  const finisher = jutsu(harmful, isWounding);
  if (finisher && foe && isDazed(foe)) return finisher;
  const usual = harmful.filter((c) => c !== daze || fresh);
  return weighted(usual, rng) ?? improvise(self, band);
}
