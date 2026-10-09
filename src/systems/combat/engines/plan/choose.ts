import type { Rng } from '@/core';

import type { CombatTechnique, RangeBand } from '../../contract';
import { playable, slotted, type Card } from './cards';
import type { PlanFighter } from './state';

/**
 * Which slotted card a fighter plays this exchange. Fighters follow a few instincts (heal when
 * hurt, daze a fresh foe, punish a dazed one); otherwise they pick among the cards slotted for
 * this distance, stronger ones more often. With nothing playable they improvise a basic blow.
 */

const LOW_HEALTH = 0.35;
const DAZE_FIRST_CHANCE = 0.6;
const BASIC_WEIGHT = 5;
const STEP_WEIGHT = 5;

function jutsu(cards: readonly Card[], test: (t: CombatTechnique) => boolean): Card | undefined {
  return cards
    .flatMap((c) => (c.kind === 'jutsu' && test(c.technique) ? [c] : []))
    .sort((a, b) => b.technique.power - a.technique.power)[0];
}

function weight(card: Card): number {
  if (card.kind === 'jutsu') return Math.max(BASIC_WEIGHT, card.technique.power / 2);
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

function improvise(band: RangeBand): Card {
  return band === 'close' ? { kind: 'strike' } : { kind: 'throw' };
}

/** The situation a fighter acts in. */
export interface Moment {
  readonly band: RangeBand;
  readonly foe: PlanFighter | undefined;
}

export function chooseCard(self: PlanFighter, { band, foe }: Moment, rng: Rng): Card {
  const ready = slotted(self, band).filter((c) => playable(self, c));
  const heal = jutsu(ready, (t) => t.effect === 'heal');
  if (heal && self.health < self.maxHealth * LOW_HEALTH) return heal;
  const harmful = ready.filter((c) => c.kind !== 'jutsu' || c.technique.effect !== 'heal');
  const daze = jutsu(harmful, (t) => t.effect === 'stun' || t.effect === 'seal');
  const fresh = foe?.stunned === 0 && foe.sealed === 0;
  if (daze && fresh && rng.chance(DAZE_FIRST_CHANCE)) return daze;
  const finisher = jutsu(harmful, (t) => t.effect === 'damage');
  if (finisher && (foe?.stunned ?? 0) > 0) return finisher;
  const usual = harmful.filter((c) => c !== daze || fresh);
  return weighted(usual, rng) ?? improvise(band);
}
