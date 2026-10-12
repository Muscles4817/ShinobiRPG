import type { Verb } from '@/systems/techniques';

import type { CombatItem, CombatTechnique, RangeBand } from '../../contract';
import { chakraCost } from '../../rules/body';
import { DISPEL_CHAKRA } from '../../rules/conditions';
import { carried } from '../../rules/items';
import { canAttackFrom, homeBand } from '../../rules/kit';
import { inReach, RANGE_BANDS, reachOf, STRIKE_REACH, THROW_REACH } from '../../rules/range';
import { trumpSpent } from '../../rules/trumps';
import {
  hasVerb,
  isHarmful,
  isHindering,
  isWounding,
  moveGoal,
  techniquePower,
} from '../../rules/verbs';
import { plainSlots, type CardId, type Loadout, type PlanFighter, type Slot } from './state';

/**
 * The cards a fighter can slot for each distance, Punch Club style: a few slots per range,
 * filled with attacks, techniques that reach, defences that react on their own, and footwork
 * that tries to change the distance. Which cards sit where is the whole plan.
 */

/** Slots per distance; a sharp mind keeps one more option ready. */
const BASE_SLOTS = 3;
const EXTRA_SLOT_INTELLECT = 10;
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
  return BASE_SLOTS + (fighter.attributes.intellect >= EXTRA_SLOT_INTELLECT ? 1 : 0);
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

/** Every card this fighter could slot at a distance: basics, then jutsu, then tools. */
export function cardsFor(fighter: Kit, band: RangeBand): Card[] {
  const jutsu = fighter.techniques.map((technique): Card => ({ kind: 'jutsu', technique }));
  const tools = fighter.items.map((item): Card => ({ kind: 'item', item }));
  return [...BASIC_CARDS.map((b) => b.card), ...jutsu, ...tools].filter((c) => fitsBand(c, band));
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
  return card !== null && fitsBand(card, band);
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

function strongest(pool: readonly Card[], test: (t: CombatTechnique) => boolean): Card[] {
  return pool
    .flatMap((c) => (c.kind === 'jutsu' && test(c.technique) ? [c] : []))
    .sort((a, b) => techniquePower(b.technique) - techniquePower(a.technique));
}

function damageJutsu(cards: readonly Card[]): Card[] {
  return strongest(cards, isWounding);
}

/** How much a step towards home is worth: before attacking, after, or not at all. */
type Footwork = 'first' | 'after-attacks' | 'none';

/**
 * Whether a fighter should spend their turn moving towards home: first when their kit can't
 * attack from here or more of their jutsu reach from home; after their attacks when only a full
 * blow waits at home (kunai land softer, but stepping in hands the foe the first blow, so the
 * plan keeps throwing and lets a foe who closes in come to it).
 */
function footworkFor(fighter: PlanFighter, band: RangeBand, home: RangeBand): Footwork {
  if (band === home) return 'none';
  if (!canAttackFrom(fighter, band)) return 'first';
  const jutsuAtHome = damageJutsu(cardsFor(fighter, home)).length;
  if (jutsuAtHome > damageJutsu(cardsFor(fighter, band)).length) return 'first';
  return inReach(STRIKE_REACH, home) && !inReach(STRIKE_REACH, band) ? 'first' : 'none';
}

/**
 * A sensible starting plan, in priority order: a heal for when you're badly hurt, a sense for
 * when a foe hides, a field to set the ground (it plays only while none of yours is up),
 * footwork towards where you fight best (when it's worth a turn; a move technique rather than
 * a step), a daze, seal or confusion to spoil a foe's telegraphed jutsu, your best attack, then
 * plain blows, more attacks, a conceal, a substitution and a defence. Attacks your kit can't
 * make from a distance (an archer up close) are left out.
 */
function defaultFor(fighter: PlanFighter, band: RangeBand, home: RangeBand): Slot[] {
  const reaches = canAttackFrom(fighter, band);
  const pool = cardsFor(fighter, band).filter((c) => reaches || !isOffence(c));
  const has = (kind: Card['kind']) => pool.filter((c) => c.kind === kind);
  const towardsHome = RANGE_BANDS.indexOf(band) > RANGE_BANDS.indexOf(home) ? 'in' : 'back';
  const footwork = footworkFor(fighter, band, home);
  const step = has('step').filter((c) => c.kind === 'step' && c.direction === towardsHome);
  const flicker = strongest(pool, (t) => moveGoal(t, home) === home).slice(0, 1);
  const at = (when: Footwork) => (footwork === when ? [...flicker, ...step].slice(0, 1) : []);
  const best = (verb: Verb) => strongest(pool, (t) => hasVerb(t, verb)).slice(0, 1);
  const damage = damageJutsu(pool);
  const daze = strongest(pool, isHindering).slice(0, 1);
  const plain = (cards: readonly Card[]) => plainSlots(cards.map(cardId));
  const ordered: Slot[] = [
    ...best('heal').map((c): Slot => ({ card: cardId(c), when: 'low-health' })),
    ...best('sense').map((c): Slot => ({ card: cardId(c), when: 'foe-hidden' })),
    ...plain([...best('field'), ...at('first')]),
    ...daze.map((c): Slot => ({ card: cardId(c), when: 'foe-readying' })),
    ...plain([...damage.slice(0, 1), ...has('strike'), ...has('throw'), ...at('after-attacks')]),
    ...plain([...damage.slice(1), ...best('conceal'), ...best('substitute')]),
    ...plain([...has('guard'), ...has('dodge')]),
  ];
  const unique = ordered.filter((slot, i) => ordered.findIndex((s) => s.card === slot.card) === i);
  return unique.slice(0, slotLimit(fighter));
}

/** The default plan; a teammate pressing in plans around a closer distance than their kit's. */
export function defaultLoadout(fighter: PlanFighter, home = homeBand(fighter)): Loadout {
  const [close, mid, far] = RANGE_BANDS.map((band) => defaultFor(fighter, band, home));
  return { close: close ?? [], mid: mid ?? [], far: far ?? [] };
}

/** Footwork, attacks and tools the fighter can actually use this exchange. */
export function playable(fighter: PlanFighter, card: Card): boolean {
  if (card.kind === 'dispel') return fighter.chakra >= DISPEL_CHAKRA;
  if (card.kind === 'item') return card.item.count > 0;
  if (card.kind !== 'jutsu' || isReaction(card)) return !isReaction(card);
  if (trumpSpent(fighter, card.technique)) return false;
  return fighter.sealed === 0 && chakraCost(fighter, card.technique) <= fighter.chakra;
}
