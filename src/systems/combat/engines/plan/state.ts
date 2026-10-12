import type { CombatResult, CombatSetup, CombatState, RangeBand } from '../../contract';
import { bodyFrom, type Body } from '../../rules/body';

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
 * Whom a slotted attack aims at: the weakest foe, the strongest, the one whose telegraphed move
 * is an attack, or the team's mark (no marks yet, so it aims like `weakest`).
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

export interface PlanFighter extends Body {
  readonly stunned: number;
  readonly sealed: number;
  readonly loadout: Loadout;
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
}

export const EMPTY_LOADOUT: Loadout = { close: [], mid: [], far: [] };

function fighterFrom(setup: CombatSetup['player'], side: 'player' | 'enemy', isPlayer = false) {
  return {
    ...bodyFrom(setup, side, isPlayer),
    stunned: 0,
    sealed: 0,
    loadout: EMPTY_LOADOUT,
  };
}

export function initialFighters(setup: CombatSetup): PlanFighter[] {
  return [
    fighterFrom(setup.player, 'player', true),
    ...setup.allies.map((a) => fighterFrom(a, 'player')),
    ...setup.enemies.map((e) => fighterFrom(e, 'enemy')),
  ];
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
      'health' | 'chakra' | 'stunned' | 'sealed' | 'loadout' | 'hidden' | 'confused'
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
