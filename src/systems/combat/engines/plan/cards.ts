import { affords } from './effort';
import { canCall } from './calls';
import { canCommit } from './commitment';
import { canGather } from './gather';
import { canReveal } from '../../rules/veil';
import { hasInsectsFor } from './swarm';
import { hasDustFor } from './dust';
import { statTier, type StatGrade } from '@/systems/stats';

import type { CombatItem, CombatTechnique, RangeBand } from '../../contract';
import { DISPEL_CHAKRA } from '../../rules/conditions';
import { carried } from '../../rules/items';
import { inReach, reachOf, STRIKE_REACH, THROW_REACH } from '../../rules/range';
import { trumpSpent } from '../../rules/trumps';
import { strikeReach } from '../../rules/weaponClasses';
import { weaponMissing } from '../../rules/weapons';
import { hasVerb, isHarmful, isOpenFor } from '../../rules/verbs';
import type { CardId, PlanFighter } from './state';

/**
 * The cards a fighter can slot for each distance, Punch Club style: a few action slots per
 * range, filled with techniques that reach, tools, Search or Dispel, and committed defence (Evade
 * or Brace, which spend the turn on not being hit). A defence that reacts on its own isn't slotted
 * (each distance keeps one ready, `readiness.ts`), nor is footwork (a fighter steps
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
  | {
      readonly kind: 'strike';
      /** Where it reaches, when a long weapon takes it past close (`strikeReach`). */
      readonly reach?: readonly RangeBand[];
    }
  | { readonly kind: 'throw' }
  | { readonly kind: 'step'; readonly direction: 'in' | 'back' }
  | { readonly kind: 'guard' }
  | { readonly kind: 'dodge' }
  | { readonly kind: 'counter' }
  /** Committed defence, played as an action (`commitment.ts`). */
  | { readonly kind: 'evade' }
  | { readonly kind: 'brace' }
  /** Drawing chakra and breath back, open until the next turn (`gather.ts`). */
  | { readonly kind: 'gather' }
  /** Uncovering a veiled eye (`veil.ts`), offered only to a fighter with one covered. */
  | { readonly kind: 'reveal' }
  | { readonly kind: 'search' }
  | { readonly kind: 'dispel' }
  | { readonly kind: 'jutsu'; readonly technique: CombatTechnique }
  | { readonly kind: 'item'; readonly item: CombatItem };

/** What a fighter brings: their techniques, and the tools in their pouch. */
type Kit = Pick<PlanFighter, 'techniques' | 'items' | 'gear' | 'size' | 'empowered' | 'veiled'>;

const BASIC_CARDS: readonly { readonly id: CardId; readonly card: Card }[] = [
  { id: 'strike', card: { kind: 'strike' } },
  { id: 'throw', card: { kind: 'throw' } },
  { id: 'step-in', card: { kind: 'step', direction: 'in' } },
  { id: 'step-back', card: { kind: 'step', direction: 'back' } },
  { id: 'guard', card: { kind: 'guard' } },
  { id: 'dodge', card: { kind: 'dodge' } },
  { id: 'counter', card: { kind: 'counter' } },
  { id: 'evade', card: { kind: 'evade' } },
  { id: 'brace', card: { kind: 'brace' } },
  { id: 'gather', card: { kind: 'gather' } },
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

/** Cards that are no attack and work at any distance: defences, gathering, the senses, tools. */
type Anywhere = Extract<
  Card,
  {
    kind:
      'guard' | 'dodge' | 'evade' | 'brace' | 'gather' | 'reveal' | 'search' | 'dispel' | 'item';
  }
>;
const ANYWHERE_KINDS: readonly Card['kind'][] = [
  'guard',
  'dodge',
  'evade',
  'brace',
  'gather',
  'reveal',
  'search',
  'dispel',
  'item',
];

/** Cards that spend the turn on the fighter themself: committing, gathering, an eye uncovered. */
export type SelfCard = Extract<Card, { kind: 'evade' | 'brace' | 'gather' | 'reveal' }>;
const SELF_KINDS: readonly Card['kind'][] = ['evade', 'brace', 'gather', 'reveal'];

/** Whether a card spends the turn on the fighter themself. */
export function spendsOnSelf(card: Card): card is SelfCard {
  return SELF_KINDS.includes(card.kind);
}

/** Defences kept ready, which react on their own and never take a turn. */
export type ReadyCard = Extract<Card, { kind: 'guard' | 'dodge' | 'counter' }>;
const READY_KINDS: readonly Card['kind'][] = ['guard', 'dodge', 'counter'];

/** Whether a card is a defence kept ready. */
export function isReadyDefence(card: Card): card is ReadyCard {
  return READY_KINDS.includes(card.kind);
}

/** Whether a card works at any distance. */
export function playsAnywhere(card: Card): card is Anywhere {
  return ANYWHERE_KINDS.includes(card.kind);
}

export function fitsBand(card: Card, band: RangeBand): boolean {
  if (playsAnywhere(card)) return true;
  switch (card.kind) {
    case 'strike':
      return inReach(card.reach ?? STRIKE_REACH, band);
    case 'throw':
      return inReach(THROW_REACH, band);
    case 'step':
      return card.direction === 'in' ? band !== 'close' : band !== 'far';
    case 'counter':
      return band === 'close';
    case 'jutsu':
      return inReach(reachOf(card.technique), band);
  }
}

/** A fighter's strike: further than close with a long weapon in hand. */
export function strikeCard(fighter: Pick<PlanFighter, 'gear' | 'size' | 'empowered'>): Card {
  const reach = strikeReach(fighter);
  return reach === STRIKE_REACH ? { kind: 'strike' } : { kind: 'strike', reach };
}

/** A basic card as this fighter plays it (their strike reaches as their weapon does). */
function basicFor(fighter: Kit, card: Card): Card {
  return card.kind === 'strike' ? strikeCard(fighter) : card;
}

/** Every card this fighter's kit holds at a distance, of any kind: basics, jutsu, tools. */
export function kitCards(fighter: Kit, band: RangeBand): Card[] {
  const basics = BASIC_CARDS.map((b) => basicFor(fighter, b.card));
  const jutsu = fighter.techniques.map((technique): Card => ({ kind: 'jutsu', technique }));
  const tools = fighter.items.map((item): Card => ({ kind: 'item', item }));
  const eye: Card[] = (fighter.veiled ?? []).length > 0 ? [{ kind: 'reveal' }] : [];
  return [...basics, ...eye, ...jutsu, ...tools].filter((c) => fitsBand(c, band));
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

/** The actions this fighter could slot at a distance: jutsu, tools, Evade, Brace, Search and Dispel. */
export function cardsFor(fighter: Kit, band: RangeBand): Card[] {
  return kitCards(fighter, band).filter(isAction);
}

/** The defences this fighter could keep ready at a distance: one is chosen (`readiness.ts`). */
export function reactionsFor(fighter: Kit, band: RangeBand): Card[] {
  return kitCards(fighter, band).filter(isReaction);
}

export function findCard(fighter: Kit, id: CardId): Card | null {
  const basic = BASIC_CARDS.find((b) => b.id === id);
  if (basic) return basicFor(fighter, basic.card);
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

/** A defence of any kind: one kept ready (Guard, Dodge, Counter) or committed to (Evade, Brace). */
export type DefenceCard = Extract<
  Card,
  { kind: 'guard' | 'dodge' | 'counter' | 'evade' | 'brace' }
>;

const DEFENCE_KINDS: readonly Card['kind'][] = ['guard', 'dodge', 'counter', 'evade', 'brace'];

/** Whether a card is a defence of any kind (a substitution aside, which is a technique). */
export function isDefenceCard(card: Card): card is DefenceCard {
  return DEFENCE_KINDS.includes(card.kind);
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
  if (card.kind === 'evade' || card.kind === 'brace') return canCommit(fighter, card.kind);
  if (card.kind === 'gather') return canGather(fighter);
  if (card.kind === 'reveal') return canReveal(fighter);
  if (card.kind === 'item') return card.item.count > 0;
  if (card.kind !== 'jutsu' || isReaction(card)) return !isReaction(card);
  if (trumpSpent(fighter, card.technique) || !isOpenFor(fighter, card.technique)) return false;
  if (!canCall(fighter, card.technique)) return false;
  if (!hasInsectsFor(fighter, card.technique)) return false;
  if (!hasDustFor(fighter, card.technique)) return false;
  return affords(fighter, card.technique);
}
