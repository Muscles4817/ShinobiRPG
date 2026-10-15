import { statTier, type StatGrade } from '@/systems/stats';

import type { CombatItem, CombatTechnique, RangeBand } from '../../contract';
import { chakraCost } from '../../rules/body';
import { DISPEL_CHAKRA } from '../../rules/conditions';
import { carried } from '../../rules/items';
import { inReach, reachOf, STRIKE_REACH, THROW_REACH } from '../../rules/range';
import { trumpSpent } from '../../rules/trumps';
import { weaponMissing } from '../../rules/weapons';
import { hasVerb, isHarmful } from '../../rules/verbs';
import type { CardId, PlanFighter } from './state';

/**
 * The cards a fighter can slot for each distance, Punch Club style: a few action slots per
 * range, filled with techniques that reach, tools, and Search or Dispel. Defences aren't slotted
 * (each distance keeps one reaction ready, `readiness.ts`), nor is footwork (a fighter steps
 * towards the distance they fight at on their own), nor plain blows (what anyone falls back on).
 * Which actions sit where is the whole plan, and a sharper mind holds more of them.
 */

/** Action slots per distance by intellect grade: a strategist plans deeper than a brawler. */
const SLOTS_BY_INTELLECT: Readonly<Record<StatGrade, number>> = {
  E: 2,
  D: 3,
  C: 4,
  B: 5,
  A: 5,
  S: 5,
};
const JUTSU_PREFIX = 'jutsu:';
export const ITEM_PREFIX = 'item:';

export type Card =
  | { readonly kind: 'strike' }
  | { readonly kind: 'throw' }
  | { readonly kind: 'step'; readonly direction: 'in' | 'back' }
  | { readonly kind: 'guard' }
  | { readonly kind: 'dodge' }
  | { readonly kind: 'counter' }
  | { readonly kind: 'search' }
  | { readonly kind: 'dispel' }
  | { readonly kind: 'jutsu'; readonly technique: CombatTechnique }
  | { readonly kind: 'item'; readonly item: CombatItem };

/** What a fighter brings: their techniques, and the tools in their pouch. */
type Kit = Pick<PlanFighter, 'techniques' | 'items'>;

const BASIC_CARDS: readonly { readonly id: CardId; readonly card: Card }[] = [
  { id: 'strike', card: { kind: 'strike' } },
  { id: 'throw', card: { kind: 'throw' } },
  { id: 'step-in', card: { kind: 'step', direction: 'in' } },
  { id: 'step-back', card: { kind: 'step', direction: 'back' } },
  { id: 'guard', card: { kind: 'guard' } },
  { id: 'dodge', card: { kind: 'dodge' } },
  { id: 'counter', card: { kind: 'counter' } },
  { id: 'search', card: { kind: 'search' } },
  { id: 'dispel', card: { kind: 'dispel' } },
];

export function slotLimit(fighter: Pick<PlanFighter, 'attributes'>): number {
  return SLOTS_BY_INTELLECT[statTier(fighter.attributes.intellect).grade];
}

export function cardId(card: Card): CardId {
  if (card.kind === 'jutsu') return `${JUTSU_PREFIX}${card.technique.id}`;
  if (card.kind === 'item') return `${ITEM_PREFIX}${card.item.id}`;
  return card.kind === 'step' ? `step-${card.direction}` : card.kind;
}

export function fitsBand(card: Card, band: RangeBand): boolean {
  switch (card.kind) {
    case 'strike':
      return inReach(STRIKE_REACH, band);
    case 'throw':
      return inReach(THROW_REACH, band);
    case 'step':
      return card.direction === 'in' ? band !== 'close' : band !== 'far';
    case 'counter':
      return band === 'close';
    case 'guard':
    case 'dodge':
    case 'search':
    case 'dispel':
    case 'item':
      return true;
    case 'jutsu':
      return inReach(reachOf(card.technique), band);
  }
}

/** Every card this fighter's kit holds at a distance, of any kind: basics, jutsu, tools. */
export function kitCards(fighter: Kit, band: RangeBand): Card[] {
  const jutsu = fighter.techniques.map((technique): Card => ({ kind: 'jutsu', technique }));
  const tools = fighter.items.map((item): Card => ({ kind: 'item', item }));
  return [...BASIC_CARDS.map((b) => b.card), ...jutsu, ...tools].filter((c) => fitsBand(c, band));
}

/** Footwork: a step, or a technique that does nothing but move its user. */
export function isFootwork(card: Card): boolean {
  if (card.kind === 'jutsu') return card.technique.effects.every((e) => e.verb === 'move');
  return card.kind === 'step';
}

/** A plain blow or throw: what anyone falls back on, never slotted. */
function isPlainBlow(card: Card): boolean {
  return card.kind === 'strike' || card.kind === 'throw';
}

/** An action for a slot: anything but a defence, footwork or a plain blow. */
export function isAction(card: Card): boolean {
  return !isReaction(card) && !isFootwork(card) && !isPlainBlow(card);
}

/** The actions this fighter could slot at a distance: jutsu, tools, Search and Dispel. */
export function cardsFor(fighter: Kit, band: RangeBand): Card[] {
  return kitCards(fighter, band).filter(isAction);
}

/** The defences this fighter could keep ready at a distance: one is chosen (`readiness.ts`). */
export function reactionsFor(fighter: Kit, band: RangeBand): Card[] {
  return kitCards(fighter, band).filter(isReaction);
}

export function findCard(fighter: Kit, id: CardId): Card | null {
  const basic = BASIC_CARDS.find((b) => b.id === id);
  if (basic) return basic.card;
  if (id.startsWith(ITEM_PREFIX)) {
    const item = carried(fighter, id.slice(ITEM_PREFIX.length));
    return item ? { kind: 'item', item } : null;
  }
  const technique = fighter.techniques.find((t) => `${JUTSU_PREFIX}${t.id}` === id);
  return technique ? { kind: 'jutsu', technique } : null;
}

/**
 * Whether a remembered card still belongs at a distance. Tools stay even when the pouch has
 * none, so the plan works again once you restock; until then they simply don't play.
 */
export function keepsInLoadout(fighter: Kit, band: RangeBand, id: CardId): boolean {
  if (id.startsWith(ITEM_PREFIX)) return true;
  const card = findCard(fighter, id);
  return card !== null && isAction(card) && fitsBand(card, band);
}

/** The cards slotted at a distance, resolved, in priority order. */
export function slotted(fighter: PlanFighter, band: RangeBand): Card[] {
  return fighter.loadout[band].flatMap(({ card: id }) => {
    const card = findCard(fighter, id);
    return card && fitsBand(card, band) ? [card] : [];
  });
}

/**
 * Defences react on their own (a substitution among them); everything else is something you
 * do on your turn.
 */
export function isReaction(card: Card): boolean {
  if (card.kind === 'jutsu') return hasVerb(card.technique, 'substitute');
  return card.kind === 'guard' || card.kind === 'dodge' || card.kind === 'counter';
}

/** Cards that hurt or hinder a foe: what reach and confusion rule out. */
export function isOffence(card: Card): boolean {
  if (card.kind === 'jutsu') return isHarmful(card.technique);
  if (card.kind === 'item') return card.item.effect === 'blast';
  return card.kind === 'strike' || card.kind === 'throw';
}

/** An offence aimed at someone in sight; an area technique needs no aim. */
export function needsAim(card: Card): boolean {
  if (card.kind === 'jutsu' && hasVerb(card.technique, 'area')) return false;
  return isOffence(card);
}

/** Why the fighter can't use this card at all, whatever the moment: a blade art with no blade. */
export function cardBlocked(fighter: Pick<PlanFighter, 'gear'>, card: Card): string | null {
  return card.kind === 'jutsu' ? weaponMissing(fighter, card.technique) : null;
}

/** Footwork, attacks and tools the fighter can actually use this exchange. */
export function playable(fighter: PlanFighter, card: Card): boolean {
  if (cardBlocked(fighter, card)) return false;
  if (card.kind === 'dispel') return fighter.chakra >= DISPEL_CHAKRA;
  if (card.kind === 'item') return card.item.count > 0;
  if (card.kind !== 'jutsu' || isReaction(card)) return !isReaction(card);
  if (trumpSpent(fighter, card.technique)) return false;
  return fighter.sealed === 0 && chakraCost(fighter, card.technique) <= fighter.chakra;
}
