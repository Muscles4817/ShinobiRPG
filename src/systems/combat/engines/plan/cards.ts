import type { CombatItem, CombatItemEffect, CombatTechnique, RangeBand } from '../../contract';
import { chakraCost } from '../../rules/body';
import { DISPEL_CHAKRA } from '../../rules/conditions';
import { carried } from '../../rules/items';
import { canAttackFrom, homeBand } from '../../rules/kit';
import { inReach, RANGE_BANDS, reachOf, STRIKE_REACH, THROW_REACH } from '../../rules/range';
import type { CardId, Loadout, PlanFighter } from './state';

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

function fitsBand(card: Card, band: RangeBand): boolean {
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

/** The cards slotted at a distance, resolved. */
export function slotted(fighter: PlanFighter, band: RangeBand): Card[] {
  return fighter.loadout[band].flatMap((id) => {
    const card = findCard(fighter, id);
    return card && fitsBand(card, band) ? [card] : [];
  });
}

/** Defences react on their own; everything else is something you do on your turn. */
export function isReaction(card: Card): boolean {
  return card.kind === 'guard' || card.kind === 'dodge' || card.kind === 'counter';
}

/** Cards that hurt or hinder a foe: what reach and confusion rule out. */
export function isOffence(card: Card): boolean {
  if (card.kind === 'jutsu') return card.technique.effect !== 'heal';
  if (card.kind === 'item') return card.item.effect === 'blast';
  return card.kind === 'strike' || card.kind === 'throw';
}

const TOOL_DOES: Readonly<Record<CombatItemEffect, string>> = {
  smoke: 'Vanish until you attack',
  flash: 'Reveal hidden foes',
  blast: 'Seal blast · through armour',
  chakra: 'Restore chakra',
  heal: 'Restore health',
  clarity: 'Clear confusion',
};

/** A tool card's detail: how many are left and what it does. */
export function toolDetail(item: CombatItem): string {
  return `×${item.count} · ${TOOL_DOES[item.effect]}`;
}

const EFFECT_WORD: Readonly<Record<CombatTechnique['effect'], string>> = {
  damage: 'Attack',
  stun: 'Daze',
  seal: 'Seal',
  heal: 'Heal when hurt',
};

export function cardLabel(card: Card): string {
  switch (card.kind) {
    case 'strike':
      return 'Strike';
    case 'throw':
      return 'Kunai';
    case 'step':
      return card.direction === 'in' ? 'Close in' : 'Back off';
    case 'guard':
      return 'Guard';
    case 'dodge':
      return 'Dodge';
    case 'counter':
      return 'Counter';
    case 'search':
      return 'Search';
    case 'dispel':
      return 'Dispel';
    case 'jutsu':
      return card.technique.name;
    case 'item':
      return card.item.name;
  }
}

export function cardDetail(card: Card, fighter: PlanFighter): string {
  switch (card.kind) {
    case 'strike':
      return 'Attack · no chakra';
    case 'throw':
      return 'Attack · no chakra';
    case 'step':
      return card.direction === 'in' ? 'Try to get closer' : 'Try to open distance';
    case 'guard':
      return 'Reacts · take less damage';
    case 'dodge':
      return 'Reacts · may avoid a hit';
    case 'counter':
      return 'Reacts · hit back up close';
    case 'search':
      return 'Find hidden foes · perception';
    case 'dispel':
      return `Break illusions · ${DISPEL_CHAKRA} chakra`;
    case 'jutsu':
      return `${EFFECT_WORD[card.technique.effect]} · ${chakraCost(fighter, card.technique)} chakra`;
    case 'item':
      return toolDetail(card.item);
  }
}

function strongest(pool: readonly Card[], test: (t: CombatTechnique) => boolean): Card[] {
  return pool
    .flatMap((c) => (c.kind === 'jutsu' && test(c.technique) ? [c] : []))
    .sort((a, b) => b.technique.power - a.technique.power);
}

/**
 * A sensible starting plan: footwork towards where you fight best, your best moves, a defence.
 * Attacks your kit can't make from a distance (an archer up close) are left out.
 */
function defaultFor(fighter: PlanFighter, band: RangeBand, home: RangeBand): CardId[] {
  const reaches = canAttackFrom(fighter, band);
  const pool = cardsFor(fighter, band).filter((c) => reaches || !isOffence(c));
  const has = (kind: Card['kind']) => pool.filter((c) => c.kind === kind);
  const towardsHome = RANGE_BANDS.indexOf(band) > RANGE_BANDS.indexOf(home) ? 'in' : 'back';
  const footwork =
    band === home
      ? []
      : has('step').filter((c) => c.kind === 'step' && c.direction === towardsHome);
  const damage = strongest(pool, (t) => t.effect === 'damage');
  const ordered: Card[] = [
    ...footwork,
    ...damage.slice(0, 1),
    ...strongest(pool, (t) => t.effect === 'stun' || t.effect === 'seal').slice(0, 1),
    ...has('strike'),
    ...has('throw'),
    ...damage.slice(1),
    ...has('guard'),
  ];
  return [...new Set(ordered.map(cardId))].slice(0, slotLimit(fighter));
}

export function defaultLoadout(fighter: PlanFighter): Loadout {
  const home = homeBand(fighter);
  const [close, mid, far] = RANGE_BANDS.map((band) => defaultFor(fighter, band, home));
  return { close: close ?? [], mid: mid ?? [], far: far ?? [] };
}

/** Footwork, attacks and tools the fighter can actually use this exchange. */
export function playable(fighter: PlanFighter, card: Card): boolean {
  if (card.kind === 'dispel') return fighter.chakra >= DISPEL_CHAKRA;
  if (card.kind === 'item') return card.item.count > 0;
  if (card.kind !== 'jutsu') return !isReaction(card);
  return fighter.sealed === 0 && chakraCost(fighter, card.technique) <= fighter.chakra;
}
