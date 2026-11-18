import type { CombatTechnique, RangeBand } from '../../contract';
import { RANGE_BANDS } from '../../rules/range';
import { hasVerb, isHindering, isWounding } from '../../rules/verbs';
import { findCard, slotLimit, type Card } from './cards';
import { defaultLoadout, defaultReadiness, type PlanShape } from './defaults';
import type { PlayerOrder } from './planningShape';
import { strongestBand } from './stepping';
import type { Loadout, PlanFighter, Slot } from './state';

/**
 * The mind's draft of the player's plan (`docs/design/combat-ai-plan.md` Part 9): at "plan then
 * edit" and at "orders", each round, the slots you set yourself stay exactly as they are and the
 * mind fills the rest from the plan it would fight with (`defaults.ts`), bent by your order and
 * leaving out anything you forbade. Each drafted slot carries a line of why.
 */

/** How an order bends the draft: where to fight from, and whether to set others up. */
function shapeOf(fighter: PlanFighter, order: PlayerOrder): PlanShape {
  switch (order) {
    case 'press':
      return { home: 'close' };
    case 'distance': {
      const best = strongestBand(fighter);
      return { home: best === 'close' ? 'mid' : best };
    }
    case 'setup':
      return { support: true };
    case 'safe':
    case 'free':
      return {};
  }
}

/** Playing it safe keeps a Brace for when you are hurt and a Gather for when you run dry. */
const SAFE_SLOTS: readonly Slot[] = [
  { card: 'brace', when: 'low-health' },
  { card: 'gather', when: 'low-chakra' },
];

/** Why the mind drafted a card that isn't a technique, by its kind. */
const PLAIN_REASONS: Readonly<Partial<Record<Card['kind'], string>>> = {
  search: 'Finds a foe who hides.',
  brace: 'Digs in when you are hurt.',
  gather: 'Draws chakra back when you run low.',
  evade: 'Gets you clear of what would hurt most.',
  dispel: 'Breaks an illusion when one is up.',
  throw: 'Something to throw from range.',
  item: 'From your pouch, for when it is needed.',
};

/** Why the mind drafted a technique, in a line. */
function techniqueReason(t: CombatTechnique, first: boolean): string {
  if (t.needsTarget === 'open') return 'Finishes a foe left open.';
  if (hasVerb(t, 'heal')) return 'Mends you when you are hurt.';
  if (isHindering(t) && !isWounding(t)) return 'Holds them for what comes next.';
  if (isWounding(t)) return first ? 'Your strongest attack here.' : 'Another way to hurt them.';
  return 'Readies you for the fight.';
}

/** Why the mind drafted a card, in a line. */
export function draftReason(card: Card | null, first: boolean): string {
  if (!card) return 'Drafted for you.';
  if (card.kind === 'jutsu') return techniqueReason(card.technique, first);
  return PLAIN_REASONS[card.kind] ?? (first ? 'Your surest attack here.' : 'Another way in.');
}

/** One distance's draft: your slots kept where they are, the rest filled by the mind. */
function draftBand(fighter: PlanFighter, band: RangeBand, proposed: readonly Slot[]): Slot[] {
  const owned = new Set(fighter.owned?.[band] ?? []);
  const forbidden = new Set(fighter.forbidden ?? []);
  const kept = fighter.loadout[band].filter((s) => owned.has(s.card));
  const fills = proposed.filter(
    (s) => !owned.has(s.card) && !forbidden.has(s.card) && findCard(fighter, s.card) !== null,
  );
  const room = Math.max(0, slotLimit(fighter) - kept.length);
  return [...kept, ...fills.slice(0, room)];
}

function proposal(
  fighter: PlanFighter,
  among: readonly PlanFighter[],
  order: PlayerOrder,
): Loadout {
  const drafted = defaultLoadout(fighter, among, shapeOf(fighter, order));
  if (order !== 'safe') return drafted;
  const safe = (band: RangeBand) => [
    ...SAFE_SLOTS.filter((s) => findCard(fighter, s.card) !== null),
    ...drafted[band],
  ];
  return { close: safe('close'), mid: safe('mid'), far: safe('far') };
}

function reasons(fighter: PlanFighter, loadout: Loadout): Record<string, string> {
  const owned = (band: RangeBand, card: string) => fighter.owned?.[band]?.includes(card) ?? false;
  return Object.fromEntries(
    RANGE_BANDS.flatMap((band) => {
      let attacked = false;
      return loadout[band]
        .filter((s) => !owned(band, s.card))
        .map((s) => {
          const card = findCard(fighter, s.card);
          const first = !attacked;
          attacked ||= card !== null && card.kind !== 'item' && card.kind !== 'search';
          return [`${band}:${s.card}`, draftReason(card, first)];
        });
    }),
  );
}

/** The player's fighter with the mind's draft laid around the slots they set. */
export function drafted(fighter: PlanFighter, among: readonly PlanFighter[]): PlanFighter {
  if (!fighter.planning) return fighter;
  const order = fighter.order ?? 'free';
  const proposed = proposal(fighter, among, order);
  const [close, mid, far] = RANGE_BANDS.map((band) => draftBand(fighter, band, proposed[band]));
  const loadout: Loadout = { close: close ?? [], mid: mid ?? [], far: far ?? [] };
  // An order that says where to fight sets it; otherwise where you fight stays yours.
  const home =
    order === 'press' || order === 'distance'
      ? defaultReadiness(fighter, shapeOf(fighter, order)).keepAt
      : undefined;
  return {
    ...fighter,
    ...(home ? { keepAt: home } : {}),
    loadout,
    draftedWhy: reasons(fighter, loadout),
  };
}
