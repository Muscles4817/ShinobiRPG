import type { CombatOption, RangeBand } from '../../contract';
import { RANGE_BANDS, RANGE_LABEL } from '../../rules/range';
import {
  cardId,
  cardsFor,
  findCard,
  isOffence,
  isReaction,
  ITEM_PREFIX,
  slotLimit,
  type Card,
} from './cards';
import { cardDetail, cardLabel } from './wording';
import {
  patch,
  playerOf,
  SLOT_CONDITIONS,
  TARGET_RULES,
  type CardId,
  type PlanFighter,
  type PlanState,
  type Slot,
  type SlotCondition,
  type TargetRule,
} from './state';

/**
 * The card table between rounds: for each distance, every card you could slot (tap to put it
 * in or take it out) and, for the cards slotted, their order and how each plays: when (a
 * condition from `priority.ts`) and at whom. Every edit is an option the fight screen shows.
 */

const SLOT_PREFIX = 'slot:';
const RAISE_PREFIX = 'raise:';
const WHEN_PREFIX = 'when:';
const AIM_PREFIX = 'aim:';
const ALWAYS = 'always';

const WHEN_LABEL: Readonly<Record<SlotCondition | typeof ALWAYS, string>> = {
  always: 'Whenever it can',
  'foe-dazed': 'Foe dazed or sealed',
  'foe-readying': 'Foe readying a jutsu',
  'low-health': 'Below a third of my health',
  'low-chakra': 'My chakra is low',
  'foe-hidden': 'A foe is hidden',
};

/**
 * The target rules offered at the table. `marked` is reserved for the team mark, which doesn't
 * exist yet, so it isn't offered: what the player is told is what the code does.
 */
const AIM_LABEL: Readonly<Partial<Record<TargetRule, string>>> = {
  weakest: 'Weakest foe',
  strongest: 'Strongest foe',
  threat: 'Foe threatening our back row',
};

/** Why a card can't go in a slot: slots full, or a tool you have none of. */
function slotBlocker(card: Card, full: boolean): string | null {
  if (full) return 'Slots full. Take a card out first.';
  return card.kind === 'item' && card.item.count <= 0 ? `No ${card.item.name} left.` : null;
}

function entryId(band: RangeBand, id: CardId): string {
  return `${SLOT_PREFIX}${band}:${id}`;
}

function rankOf(player: PlanFighter, band: RangeBand, id: CardId): number {
  return player.loadout[band].findIndex((s) => s.card === id);
}

/** Setting choices for one slotted card: move up, when it plays, whom it aims at. */
function adjustments(band: RangeBand, slot: Slot, rank: number, card: Card | null): CombatOption[] {
  const adjusts = entryId(band, slot.card);
  const base = { detail: '', kind: 'plan', group: RANGE_LABEL[band], adjusts } as const;
  const raise: CombatOption[] =
    rank > 0
      ? [{ ...base, id: `${RAISE_PREFIX}${band}:${slot.card}`, label: 'Move up', setting: 'Order' }]
      : [];
  const timed = card === null || !isReaction(card);
  const conditions: readonly (SlotCondition | typeof ALWAYS)[] = [ALWAYS, ...SLOT_CONDITIONS];
  const when = (timed ? conditions : []).map((c): CombatOption => ({
    ...base,
    id: `${WHEN_PREFIX}${band}:${c}:${slot.card}`,
    label: WHEN_LABEL[c],
    setting: 'When',
    selected: (slot.when ?? ALWAYS) === c,
  }));
  const aimed = card !== null && isOffence(card);
  const aim = (aimed ? Object.entries(AIM_LABEL) : []).map(([rule, label]): CombatOption => ({
    ...base,
    id: `${AIM_PREFIX}${band}:${rule}:${slot.card}`,
    label,
    setting: 'Target',
    selected: (slot.target ?? 'weakest') === rule,
  }));
  return [...raise, ...when, ...aim];
}

/**
 * Tools remembered from an earlier fight that aren't in the pouch now: still slotted (they
 * play again once restocked), and shown so they can be taken out.
 */
function emptyPouchOptions(player: PlanFighter, band: RangeBand): CombatOption[] {
  return player.loadout[band]
    .filter((s) => s.card.startsWith(ITEM_PREFIX) && !findCard(player, s.card))
    .map((s) => ({
      id: entryId(band, s.card),
      label: 'Empty pouch',
      detail: 'None left. Restock to use',
      kind: 'plan',
      group: RANGE_LABEL[band],
      selected: true,
      rank: rankOf(player, band, s.card),
    }));
}

function slotOptions(player: PlanFighter, band: RangeBand): CombatOption[] {
  const full = player.loadout[band].length >= slotLimit(player);
  const cards = cardsFor(player, band).map((card): CombatOption => {
    const id = cardId(card);
    const rank = rankOf(player, band, id);
    const blocker = rank >= 0 ? null : slotBlocker(card, full);
    return {
      id: entryId(band, id),
      label: cardLabel(card),
      detail: cardDetail(card, player),
      kind: 'plan',
      group: RANGE_LABEL[band],
      selected: rank >= 0,
      ...(rank >= 0 ? { rank } : {}),
      ...(card.kind === 'jutsu' ? { discipline: card.technique.discipline } : {}),
      ...(blocker ? { disabledReason: blocker } : {}),
    };
  });
  const settings = player.loadout[band].flatMap((slot, rank) =>
    adjustments(band, slot, rank, findCard(player, slot.card)),
  );
  return [...cards, ...emptyPouchOptions(player, band), ...settings];
}

/** Every option at the card table, distance by distance. */
export function tableOptions(player: PlanFighter): CombatOption[] {
  return RANGE_BANDS.flatMap((band) => slotOptions(player, band));
}

/** An edit to the plan, read back from one of our own option ids. */
interface Edit {
  readonly kind: 'slot' | 'raise' | 'when' | 'aim';
  readonly band: RangeBand;
  /** The condition or target rule an edit sets. */
  readonly value: string;
  readonly card: CardId;
}

const PREFIXES = [
  { prefix: SLOT_PREFIX, kind: 'slot', valued: false },
  { prefix: RAISE_PREFIX, kind: 'raise', valued: false },
  { prefix: WHEN_PREFIX, kind: 'when', valued: true },
  { prefix: AIM_PREFIX, kind: 'aim', valued: true },
] as const;

function parse(optionId: string): Edit | null {
  const found = PREFIXES.find((p) => optionId.startsWith(p.prefix));
  if (!found) return null;
  const parts = optionId.slice(found.prefix.length).split(':');
  const fields = found.valued ? 2 : 1;
  // The id came from our own options, so the band is one of RANGE_BANDS.
  const band = parts[0] as RangeBand;
  const value = found.valued ? (parts[1] ?? '') : '';
  return { kind: found.kind, band, value, card: parts.slice(fields).join(':') };
}

function toggled(slots: readonly Slot[], card: CardId): Slot[] {
  return slots.some((s) => s.card === card)
    ? slots.filter((s) => s.card !== card)
    : [...slots, { card }];
}

function raised(slots: readonly Slot[], card: CardId): Slot[] {
  const at = slots.findIndex((s) => s.card === card);
  const [before, moving] = [slots[at - 1], slots[at]];
  if (at <= 0 || !before || !moving) return [...slots];
  return [...slots.slice(0, at - 1), moving, before, ...slots.slice(at + 1)];
}

function set(slot: Slot, edit: Edit): Slot {
  // "Always" is no condition, and aiming at the weakest is the default.
  const when = edit.kind === 'when' ? SLOT_CONDITIONS.find((c) => c === edit.value) : slot.when;
  const target = edit.kind === 'aim' ? TARGET_RULES.find((r) => r === edit.value) : slot.target;
  return {
    card: slot.card,
    ...(when ? { when } : {}),
    ...(target && target !== 'weakest' ? { target } : {}),
  };
}

function edited(slots: readonly Slot[], edit: Edit): Slot[] {
  switch (edit.kind) {
    case 'slot':
      return toggled(slots, edit.card);
    case 'raise':
      return raised(slots, edit.card);
    case 'when':
    case 'aim':
      return slots.map((s) => (s.card === edit.card ? set(s, edit) : s));
  }
}

/** Applies a card-table option to the player's plan, or null when it isn't one. */
export function editPlan(state: PlanState, optionId: string): PlanState | null {
  const edit = parse(optionId);
  if (!edit) return null;
  const player = playerOf(state);
  const loadout = { ...player.loadout, [edit.band]: edited(player.loadout[edit.band], edit) };
  return { ...state, fighters: patch(state.fighters, player.id, { loadout }) };
}
