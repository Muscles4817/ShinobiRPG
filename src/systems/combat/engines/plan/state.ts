import type {
  CombatResult,
  CombatRow,
  CombatSetup,
  CombatSide,
  CombatState,
  RangeBand,
} from '../../contract';
import { bodyFrom, type Body } from '../../rules/body';
import { formed, preferredRow } from '../../rules/rows';
import type { TrumpMemory } from '../../rules/trumps';
import type { ActiveField } from '../../rules/verbs';
import type { CloneBody, EmpowerMemory, TrapMemory } from '../../rules/verbs';

export const PLAN_ENGINE_ID = 'plan-v1';
export const LOG_LIMIT = 60;

/** A card slotted for one distance: a basic, a footwork card, a defence, or `jutsu:<id>`. */
export type CardId = string;

/**
 * When a slotted card may play (see `priority.ts`): a foe is dazed or sealed, a foe is readying
 * a jutsu, I'm below a third of my health, my chakra is low, a foe is hidden.
 */
export const SLOT_CONDITIONS = [
  'foe-dazed',
  'foe-readying',
  'low-health',
  'low-chakra',
  'foe-hidden',
] as const;
export type SlotCondition = (typeof SLOT_CONDITIONS)[number];

/**
 * Whom a slotted attack aims at: the weakest foe, the strongest, the one threatening my back
 * row (its telegraphed attack can reach someone there), or the team's mark (no marks yet, so
 * it aims like `weakest`).
 */
export const TARGET_RULES = ['weakest', 'strongest', 'threat', 'marked'] as const;
export type TargetRule = (typeof TARGET_RULES)[number];

/** One slot of a plan: the card, and optionally when it plays and whom it aims at. */
export interface Slot {
  readonly card: CardId;
  readonly when?: SlotCondition;
  readonly target?: TargetRule;
}

/** The cards a fighter brings to each distance, in priority order: earlier slots play first. */
export type Loadout = Readonly<Record<RangeBand, readonly Slot[]>>;

/** Slots that always play and aim at the weakest, one per card, in order. */
export function plainSlots(cards: readonly CardId[]): Slot[] {
  return cards.map((card) => ({ card }));
}

export interface PlanFighter extends Body, TrumpMemory, EmpowerMemory, CloneBody, TrapMemory {
  /** Turns a daze will still cost: a dazed fighter loses its next turn. */
  readonly stunned: number;
  readonly sealed: number;
  readonly loadout: Loadout;
  /** Front or back row of their side (see `rules/rows.ts`); fixed for the fight. */
  readonly row: CombatRow;
  /** How hard they are to find while hidden, once a conceal set it (`concealmentOf`). */
  readonly concealment?: number;
  /**
   * The last exchange a daze leaves this fighter open (no defences, a target for finishers),
   * even after the lost turn: through the exchange after the daze, so whoever dazed them
   * gets their next turn against it. Absent when not dazed (and in fights saved before it).
   */
  readonly openUntil?: number;
  /** Their substitution has swapped them out of a hit this round: it works once a round. */
  readonly substituteSpent?: boolean;
}

/** Dazed: about to lose a turn, or still reeling from one. */
export function isDazed(f: Pick<PlanFighter, 'stunned' | 'openUntil'>): boolean {
  return f.stunned > 0 || f.openUntil !== undefined;
}

/**
 * A fresh daze, dealt in exchange `exchange`: it costs one turn, and leaves its target open
 * through the next exchange. Dazes don't stack: rounds play out on their own, so a chain of
 * them would leave the player watching themselves lose.
 */
export function dazeIn(exchange: number): Pick<PlanFighter, 'stunned' | 'openUntil'> {
  return { stunned: 1, openUntil: exchange + 1 };
}

/** At the end of an exchange: a daze whose last open exchange this was wears off. */
export function wearOffDaze(f: PlanFighter, exchange: number): PlanFighter {
  if (f.openUntil === undefined || f.openUntil > exchange) return f;
  const { openUntil: _done, ...rest } = f;
  return rest;
}

export interface PlanState {
  /** Setting up cards between rounds, then watching the round play out. */
  readonly phase: 'loadout' | 'fight';
  /** Exchanges fought so far, plus one. */
  readonly round: number;
  /** Which round of the fight this is; cards can be changed between rounds. */
  readonly bout: number;
  /** Exchanges already fought in this round. */
  readonly exchange: number;
  readonly fighters: readonly PlanFighter[];
  readonly range: RangeBand;
  /** Cards each fighter has been seen to use, so you can adapt between rounds. */
  readonly seen: Readonly<Record<string, readonly CardId[]>>;
  /** The card each foe has announced for the next exchange (see `intent.ts`). */
  readonly intents: Readonly<Record<string, CardId>>;
  readonly log: readonly string[];
  readonly result: CombatResult | null;
  readonly canFlee: boolean;
  /** The side that moved first (from the fight's opening) acts first in exchange 1. */
  readonly firstMover?: CombatSide;
  /** A field over the fight (mist, smoke), until it fades. */
  readonly field?: ActiveField;
}

/** One exchange in progress. */
export interface Round {
  /** The exchange number (`PlanState.round`), which decides when illusionists slip away. */
  readonly number: number;
  /** The first exchange of a round (`PlanState.exchange` is 0). */
  readonly opening?: boolean;
  readonly fighters: PlanFighter[];
  readonly range: RangeBand;
  readonly lines: readonly string[];
  readonly seen: PlanState['seen'];
  readonly intents: PlanState['intents'];
  readonly field?: ActiveField;
}

export const EMPTY_LOADOUT: Loadout = { close: [], mid: [], far: [] };

function fighterFrom(
  setup: CombatSetup['player'],
  side: 'player' | 'enemy',
  isPlayer = false,
): PlanFighter {
  return {
    ...bodyFrom(setup, side, isPlayer),
    stunned: 0,
    sealed: 0,
    loadout: EMPTY_LOADOUT,
    row: preferredRow(setup),
  };
}

/** Everyone in the fight, each side in formation. */
export function initialFighters(setup: CombatSetup): PlanFighter[] {
  return formed([
    fighterFrom(setup.player, 'player', true),
    ...setup.allies.map((a) => fighterFrom(a, 'player')),
    ...setup.enemies.map((e) => fighterFrom(e, 'enemy')),
  ]);
}

export function encode(state: PlanState): CombatState {
  return { engineId: PLAN_ENGINE_ID, data: state };
}

/** Recovers plan state from the opaque contract type. Only this engine may do this. */
export function decode(state: CombatState): PlanState {
  if (state.engineId !== PLAN_ENGINE_ID) {
    throw new Error(`Plan engine cannot read combat state from engine "${state.engineId}"`);
  }
  return state.data as PlanState;
}

export function playerOf(state: Pick<PlanState, 'fighters'>): PlanFighter {
  const player = state.fighters.find((f) => f.isPlayer);
  if (!player) throw new Error('Plan state has no player');
  return player;
}

export function patch(
  fighters: readonly PlanFighter[],
  id: string,
  change: Partial<
    Pick<
      PlanFighter,
      | 'health'
      | 'chakra'
      | 'stunned'
      | 'sealed'
      | 'loadout'
      | 'hidden'
      | 'confused'
      | 'concealment'
      | 'perks'
      | 'openUntil'
      | 'trumpsUsed'
      | 'substituteSpent'
      | 'clones'
    >
  >,
): PlanFighter[] {
  return fighters.map((f) => (f.id === id ? { ...f, ...change } : f));
}

export function say(round: Round, ...lines: string[]): Round {
  return { ...round, lines: [...round.lines, ...lines] };
}

export function fighterIn(round: Round, id: string): PlanFighter | undefined {
  return round.fighters.find((f) => f.id === id);
}
