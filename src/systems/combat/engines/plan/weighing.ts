import type { Rng } from '@/core';

import { repeatWeight } from '../../rules/familiarity';
import { techniquePower } from '../../rules/verbs';
import { beats, seenDefence, walksInto } from './adapt';
import { cardId, isOffence, type Card } from './cards';
import { beatsWeight, readsInTheMoment, worthSharpness } from './judgement';
import type { Moment } from './moment';
import { standIn } from './repertoire';
import type { DefenceKind, PlanFighter } from './state';
import type { Odds } from './whyShape';
import { cardWorth } from './worth';

/**
 * Instinct's weighted pick (`choose.ts`): among the attacks and footwork on offer, stronger cards
 * more often; for a foe, ones that get past the defence it has seen more still; and, as sharply
 * as the fighter's judgement allows, those worth more against this foe (`worth.ts`). A mind that
 * reads the fight reaches less for a technique played turns running.
 */

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

/** The card picked, and the odds every card on offer had. */
export interface Weighed {
  readonly card: Card;
  readonly odds: readonly Odds[];
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

/** A foe's lean towards what beats the defence it has seen this one keep here. */
function leanOf(self: PlanFighter, { reads, foe, band }: Moment): Lean | undefined {
  const defence = self.side === 'enemy' ? seenDefence(reads, foe, band) : undefined;
  return defence ? { defence, beatsBy: beatsWeight(self) } : undefined;
}

export function weighted(
  self: PlanFighter,
  cards: readonly Card[],
  rng: Rng,
  moment: Moment,
): Weighed | undefined {
  const lean = leanOf(self, moment);
  // A strike that plays a style is weighed as the best of its moves (`repertoire.ts`).
  const weighed = cards.map((c) => standIn(self, c));
  const leans = worthLeans(self, weighed, moment);
  const weights = weighed.map((c, i) => weight(c, lean, self, leans[i]));
  const total = weights.reduce((sum, w) => sum + w, 0);
  const odds = cards.map((c, i) => ({
    card: cardId(c),
    share: total > 0 ? (weights[i] ?? 0) / total : 0,
  }));
  let roll = rng.next() * total;
  for (const [i, card] of cards.entries()) {
    roll -= weights[i] ?? 0;
    if (roll < 0) return { card, odds };
  }
  const last = cards[cards.length - 1];
  return last ? { card: last, odds } : undefined;
}
