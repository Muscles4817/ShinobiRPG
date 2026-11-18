import type { CombatOption, RangeBand } from '../../contract';
import { RANGE_BANDS } from '../../rules/range';
import { cardId, cardsFor } from './cards';
import { drafted } from './drafting';
import {
  PLANNING_LEVELS,
  PLAYER_ORDERS,
  type PlanningLevel,
  type PlayerOrder,
  type PlayerPlanning,
} from './planningShape';
import { patch, playerOf, type PlanFighter, type PlanState } from './state';
import { editPlan } from './table';
import { cardLabel } from './wording';

/**
 * Who plans your round (`docs/design/combat-ai-plan.md` Part 9): three levels of one plan.
 * - **Your list**: every slot is yours; "Ask for a plan" fills only the empty ones.
 * - **Plan, then edit**: the mind drafts every slot you haven't set, each with its reason; a
 *   slot you change becomes yours, and you can hand one back.
 * - **Orders**: you say what you want (press in, keep your distance, play it safe, set them up)
 *   and what never to use; the mind drafts the rest each round around your pins.
 * Moving between levels loses nothing: moving up from your list keeps every slot as yours, and
 * "Hand the list back" lets the mind draft it all again.
 */

const LEVEL_PREFIX = 'who:';
const ORDER_PREFIX = 'order:';
const FORBID_PREFIX = 'forbid:';
const HANDBACK_PREFIX = 'handback:';
const ASK = 'ask-plan';
const HANDBACK_ALL = 'handback-all';

const LEVEL_WORDS: Readonly<Record<PlanningLevel, { label: string; detail: string }>> = {
  list: { label: 'Your list', detail: 'You set every slot.' },
  draft: { label: 'Plan, then edit', detail: 'The mind drafts what you leave; change any of it.' },
  orders: { label: 'Orders', detail: 'Say what you want; the mind plans the round.' },
};

const ORDER_WORDS: Readonly<Record<PlayerOrder, { label: string; detail: string }>> = {
  free: { label: 'As the mind sees fit', detail: 'Fight the way your kit fights best.' },
  press: { label: 'Press in close', detail: 'Get in and stay in.' },
  distance: { label: 'Keep your distance', detail: 'Fight from where your kit is strongest.' },
  safe: { label: 'Play it safe', detail: 'Dig in when hurt, draw breath when dry.' },
  setup: { label: 'Set them up', detail: 'Hold them for whoever finishes.' },
};

function levelOf(player: PlanFighter): PlanningLevel {
  return player.planning ?? 'list';
}

function levelOptions(player: PlanFighter): CombatOption[] {
  return PLANNING_LEVELS.map((level) => ({
    id: `${LEVEL_PREFIX}${level}`,
    ...LEVEL_WORDS[level],
    kind: 'planning',
    planning: 'level',
    selected: levelOf(player) === level,
  }));
}

function orderOptions(player: PlanFighter): CombatOption[] {
  return PLAYER_ORDERS.map((order) => ({
    id: `${ORDER_PREFIX}${order}`,
    ...ORDER_WORDS[order],
    kind: 'planning',
    planning: 'order',
    selected: (player.order ?? 'free') === order,
  }));
}

/** The techniques and tools you can forbid: never drafted, never reached for. */
function forbidOptions(player: PlanFighter): CombatOption[] {
  const hand = RANGE_BANDS.flatMap((band) => cardsFor(player, band)).filter(
    (c) => c.kind === 'jutsu' || c.kind === 'item',
  );
  const unique = hand.filter((c, i) => hand.findIndex((d) => cardId(d) === cardId(c)) === i);
  return unique.map((card) => ({
    id: `${FORBID_PREFIX}${cardId(card)}`,
    label: cardLabel(card, player),
    detail: 'Never use it',
    kind: 'planning',
    planning: 'forbid',
    selected: player.forbidden?.includes(cardId(card)) ?? false,
  }));
}

function hasPins(player: PlanFighter): boolean {
  return RANGE_BANDS.some((band) => (player.owned?.[band]?.length ?? 0) > 0);
}

/** Who plans your round, and what each level offers beside your cards. */
export function planningOptions(state: PlanState): CombatOption[] {
  const player = playerOf(state);
  const level = levelOf(player);
  const ask: CombatOption = {
    id: ASK,
    label: 'Ask for a plan',
    detail: 'The mind fills your empty slots.',
    kind: 'planning',
    planning: 'ask',
  };
  const handBack: CombatOption = {
    id: HANDBACK_ALL,
    label: 'Hand the list back',
    detail: 'The mind drafts every slot again.',
    kind: 'planning',
    planning: 'ask',
  };
  const extras =
    level === 'list'
      ? [ask]
      : [
          ...(hasPins(player) ? [handBack] : []),
          ...(level === 'orders' ? [...orderOptions(player), ...forbidOptions(player)] : []),
        ];
  return [...levelOptions(player), ...extras];
}

/** Every slot you have, as yours: what moving up from your list keeps. */
function everySlot(player: PlanFighter): NonNullable<PlayerPlanning['owned']> {
  return Object.fromEntries(RANGE_BANDS.map((b) => [b, player.loadout[b].map((s) => s.card)]));
}

function redrafted(state: PlanState, player: PlanFighter): PlanState {
  const next = drafted(player, state.fighters);
  return { ...state, fighters: state.fighters.map((f) => (f.id === player.id ? next : f)) };
}

function withLevel(state: PlanState, player: PlanFighter, level: PlanningLevel): PlanState {
  if (level === 'list') {
    const { planning: _p, owned: _o, draftedWhy: _d, order: _r, ...yours } = player;
    return { ...state, fighters: state.fighters.map((f) => (f.id === player.id ? yours : f)) };
  }
  const owned = player.planning ? player.owned : everySlot(player);
  return redrafted(state, { ...player, planning: level, owned: owned ?? {} });
}

function forbade(player: PlanFighter, card: string): PlanFighter {
  const was = player.forbidden ?? [];
  const forbidden = was.includes(card) ? was.filter((c) => c !== card) : [...was, card];
  const without = (band: RangeBand) => player.loadout[band].filter((s) => s.card !== card);
  const loadout = { close: without('close'), mid: without('mid'), far: without('far') };
  const owned = Object.fromEntries(
    RANGE_BANDS.map((b) => [b, (player.owned?.[b] ?? []).filter((c) => c !== card)]),
  );
  return { ...player, forbidden, loadout, owned };
}

function handedBack(player: PlanFighter, band: RangeBand, card: string): PlanFighter {
  const owned = { ...player.owned, [band]: (player.owned?.[band] ?? []).filter((c) => c !== card) };
  const loadout = {
    ...player.loadout,
    [band]: player.loadout[band].filter((s) => s.card !== card),
  };
  return { ...player, owned, loadout };
}

/** Asking from your list: the mind fills only the empty slots, and the list stays yours. */
function asked(state: PlanState, player: PlanFighter): PlanState {
  const filled = drafted(
    { ...player, planning: 'draft', owned: everySlot(player) },
    state.fighters,
  );
  return { ...state, fighters: patch(state.fighters, player.id, { loadout: filled.loadout }) };
}

function choice(state: PlanState, player: PlanFighter, optionId: string): PlanState | null {
  const level = PLANNING_LEVELS.find((l) => optionId === `${LEVEL_PREFIX}${l}`);
  if (level) return withLevel(state, player, level);
  const order = PLAYER_ORDERS.find((o) => optionId === `${ORDER_PREFIX}${o}`);
  if (order) {
    const { order: _was, ...rest } = player;
    return redrafted(state, order === 'free' ? rest : { ...rest, order });
  }
  if (optionId.startsWith(FORBID_PREFIX)) {
    return redrafted(state, forbade(player, optionId.slice(FORBID_PREFIX.length)));
  }
  if (optionId.startsWith(HANDBACK_PREFIX)) {
    const [band, ...card] = optionId.slice(HANDBACK_PREFIX.length).split(':');
    const at = RANGE_BANDS.find((b) => b === band);
    return at ? redrafted(state, handedBack(player, at, card.join(':'))) : null;
  }
  if (optionId === HANDBACK_ALL) return redrafted(state, { ...player, owned: {} });
  return optionId === ASK ? asked(state, player) : null;
}

/** The slot a card-table edit touched: its distance and card, read from the option id. */
function touched(optionId: string): { band: RangeBand; card: string } | null {
  const [kind, band, ...rest] = optionId.split(':');
  const at = RANGE_BANDS.find((b) => b === band);
  if (!at || !kind) return null;
  const valued = kind === 'when' || kind === 'aim';
  const plain = kind === 'slot' || kind === 'raise' || kind === 'lower';
  if (!valued && !plain) return null;
  return { band: at, card: (valued ? rest.slice(1) : rest).join(':') };
}

/** A slot you change at plan-then-edit or orders becomes yours; the mind drafts around it. */
function owning(state: PlanState, optionId: string): PlanState | null {
  const edited = editPlan(state, optionId);
  const player = edited ? playerOf(edited) : null;
  const slot = touched(optionId);
  if (!edited || !player?.planning || !slot) return edited;
  const kept = player.loadout[slot.band].some((s) => s.card === slot.card);
  const was = (player.owned?.[slot.band] ?? []).filter((c) => c !== slot.card);
  const owned = { ...player.owned, [slot.band]: kept ? [...was, slot.card] : was };
  return {
    ...edited,
    fighters: edited.fighters.map((f) => (f.id === player.id ? { ...f, owned } : f)),
  };
}

/** Applies a who-plans option or a card-table edit to the player's plan, or null when neither. */
export function editWhoPlans(state: PlanState, optionId: string): PlanState | null {
  return choice(state, playerOf(state), optionId) ?? owning(state, optionId);
}

/** As a round opens, the mind drafts again around what you set (at plan-then-edit and orders). */
export function draftedForRound(state: PlanState): PlanState {
  const player = state.fighters.find((f) => f.isPlayer);
  return player?.planning ? redrafted(state, player) : state;
}

/** Your cards at the table, marked as yours or drafted (with why) while the mind plans with you. */
export function withOwnership(
  options: readonly CombatOption[],
  player: PlanFighter,
): CombatOption[] {
  if (!player.planning) return [...options];
  return options.flatMap((o) => {
    const slot = o.kind === 'plan' && o.selected && !o.adjusts ? touched(o.id) : null;
    if (!slot) return [o];
    if (!(player.owned?.[slot.band] ?? []).includes(slot.card)) {
      const why = player.draftedWhy?.[`${slot.band}:${slot.card}`];
      return [why ? { ...o, draftedWhy: why } : o];
    }
    const back: CombatOption = {
      id: `${HANDBACK_PREFIX}${slot.band}:${slot.card}`,
      label: 'Hand it back',
      detail: '',
      kind: 'plan',
      ...(o.group ? { group: o.group } : {}),
      adjusts: o.id,
      setting: 'Yours',
    };
    return [{ ...o, mine: true as const }, back];
  });
}
