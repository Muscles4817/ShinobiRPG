import type {
  CombatGround,
  CombatOccasion,
  CombatResult,
  CombatRow,
  CombatSetup,
  CombatSide,
  CombatState,
  RangeBand,
} from '../../contract';
import { bodyFrom, type Body } from '../../rules/body';
import { numberedNames } from '../../rules/narration';
import { openingChakra, openingSteadiness } from '../../rules/provisions';
import { formed, preferredRow } from '../../rules/rows';
import type { TrumpMemory } from '../../rules/trumps';
import type {
  ActiveField,
  CloneBody,
  EmpowerMemory,
  LingeringMemory,
  TrapMemory,
} from '../../rules/verbs';
import type { CombatOrders, CombatStance } from '../../teamContract';
import type { Caller, Summoned } from './calls';
import type { Footing } from './footing';
import type { Dusty } from './dustBody';
import type { Hive } from './hive';

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
 * row (its telegraphed attack can reach someone there), or the team's mark (the foe the player
 * marked between rounds; with none, or the mark down, it aims like `weakest`).
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

/** The defence kept ready at each distance (`readiness.ts`), by card id; null keeps none. */
export type Reactions = Readonly<Record<RangeBand, CardId | null>>;

/** Kinds of attack, as an opponent sizes them up (`reads.ts`). */
export type AttackStyle = 'blow' | 'flurry' | 'break' | 'sure' | 'illusion' | 'jutsu';
/** A defence as an opponent sees it react. */
export type DefenceKind = 'guard' | 'dodge' | 'counter' | 'swap';

/** What a fighter has given away this fight: their defence at each distance, the attacks they throw. */
export interface Read {
  readonly defences: Partial<Record<RangeBand, DefenceKind>>;
  readonly attacks: Partial<Record<AttackStyle, number>>;
}

/** Everyone's read, by fighter id: what their opponents have seen of them. */
export type Reads = Readonly<Record<string, Read>>;

/** Slots that always play and aim at the weakest, one per card, in order. */
export function plainSlots(cards: readonly CardId[]): Slot[] {
  return cards.map((card) => ({ card }));
}

export interface PlanFighter
  extends
    Body,
    TrumpMemory,
    EmpowerMemory,
    CloneBody,
    TrapMemory,
    LingeringMemory,
    Footing,
    Caller,
    Summoned,
    Hive,
    Dusty {
  /** Turns a daze will still cost: a dazed fighter loses its next turn. */
  readonly stunned: number;
  readonly sealed: number;
  readonly loadout: Loadout;
  /** The defence ready at each distance (`readiness.ts`); absent in fights saved before. */
  readonly reactions?: Reactions;
  /** The distance they make for; absent: wherever they stand. */
  readonly keepAt?: RangeBand;
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
  /**
   * The last exchange a fighter is steady after a daze wore off: no fresh daze takes hold
   * until it is over, so a daze can't be chained into a lock. Absent until their first daze.
   */
  readonly steadyUntil?: number;
  /** Their substitution has swapped them out of a hit this round: it works once a round. */
  readonly substituteSpent?: boolean;
  /** A teammate's stance (see `team.ts`); the player and foes have none. */
  readonly stance?: CombatStance;
  /** What the player may change about this teammate. */
  readonly orders?: CombatOrders;
  /** Joined a partner's combination technique: their next turn went into it. */
  readonly joined?: boolean;
  /** Techniques used so far (by id, first use first), for the outcome. */
  readonly used?: readonly string[];
  /** Chakra paid so far this fight (it deepens reserves); absent until they pay any. */
  readonly chakraSpent?: number;
  /** Plain strikes thrown so far (not kunai), for the outcome's usage report. */
  readonly blows?: number;
  /** Steps played so far, for the outcome's usage report. */
  readonly footwork?: number;
  /** A meal's second wind has come (`rules/provisions.ts`): it comes once a fight. */
  readonly secondWindSpent?: boolean;
  /** How often each technique has been used this fight (`rules/familiarity.ts`). */
  readonly uses?: Readonly<Record<string, number>>;
  /** The card played last turn, and how many turns running it has been. */
  readonly streak?: { readonly card: CardId; readonly turns: number };
  /** The fighter (by id) they are holding in a channelled pin (`holding.ts`). */
  readonly holding?: string;
  /** Techniques copied this fight by watching (`mimicry.ts`). */
  readonly copied?: readonly string[];
  /** The exchange they went down in, for the fight's summary (`falls.ts`). */
  readonly fellAt?: number;
  /** Their last daze and their guard last smashed, and by whom, for the summary's turning point. */
  readonly dazedBy?: Swing;
  readonly guardBrokenBy?: Swing;
}

/** A moment that may have swung a fight: the exchange it came in, and who did it (by id). */
export interface Swing {
  readonly at: number;
  readonly by: string;
}

/** The change to a fighter who pays chakra: less left, more spent (never below empty). */
export function paying(
  f: Pick<PlanFighter, 'chakra' | 'chakraSpent'>,
  cost: number,
): Pick<PlanFighter, 'chakra' | 'chakraSpent'> {
  const paid = Math.min(f.chakra, cost);
  return { chakra: f.chakra - paid, chakraSpent: (f.chakraSpent ?? 0) + paid };
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
  /** Lines let go from the front of `log` to keep it to `LOG_LIMIT` (absent: none). */
  readonly logDropped?: number;
  readonly result: CombatResult | null;
  readonly canFlee: boolean;
  /** The side that moved first (from the fight's opening) acts first in exchange 1. */
  readonly firstMover?: CombatSide;
  /** A field over the fight (mist, smoke), until it fades. */
  readonly field?: ActiveField;
  /** Where the fight happens (`rules/ground.ts`); an open arena when absent. */
  readonly ground?: CombatGround;
  /** What kind of fight it is, for the story only (`scene.ts`); a fight for real when absent. */
  readonly occasion?: CombatOccasion;
  /** The team mark: the foe (by id) the player's side goes for. */
  readonly mark?: string;
  /** The foes' mark, when they fight as a team (`foeTeam.ts`): whom on your side they go for. */
  readonly foeMark?: string;
  /** What each fighter has given away so far (`reads.ts`); absent until anyone has. */
  readonly reads?: Reads;
  /** Only watched (`CombatSetup.watch`): no card table between rounds, both sides adapt. */
  readonly watching?: true;
}

/** A hit with an element that landed this exchange, for element combos (`combo.ts`). */
export interface ElementHit {
  readonly targetId: string;
  readonly fighterId: string;
  readonly element: NonNullable<PlanFighter['nature']>;
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
  readonly ground?: CombatGround;
  readonly occasion?: CombatOccasion;
  readonly mark?: string;
  readonly foeMark?: string;
  readonly reads?: Reads;
  /** Who has acted this exchange (a clash spends the answerer's turn early, `clash.ts`). */
  readonly acted?: readonly string[];
  /** Elemental hits landed this exchange. */
  readonly hits?: readonly ElementHit[];
  /** Only watched: no one plans for the player's fighter, who fights on their own. */
  readonly watching?: true;
  /** The card the turn just taken played, for its narration's force (`force.ts`). */
  readonly played?: CardId;
  /** The story's last lines before this exchange, so words aren't picked twice running. */
  readonly recent?: readonly string[];
}

export const EMPTY_LOADOUT: Loadout = { close: [], mid: [], far: [] };

/** A summon's body as it is called (`summons.ts`): a fighter of its caller's side. */
export function calledFighter(setup: CombatSetup['player'], side: 'player' | 'enemy'): PlanFighter {
  return fighterFrom(setup, side);
}

function fighterFrom(
  setup: CombatSetup['player'],
  side: 'player' | 'enemy',
  isPlayer = false,
): PlanFighter {
  const body = bodyFrom(setup, side, isPlayer);
  const steady = openingSteadiness(body);
  return {
    ...body,
    chakra: openingChakra(body),
    stunned: 0,
    sealed: 0,
    loadout: EMPTY_LOADOUT,
    row: preferredRow(setup),
    ...(steady !== undefined ? { steadyUntil: steady } : {}),
  };
}

/** Everyone in the fight, each side in formation. */
export function initialFighters(setup: CombatSetup): PlanFighter[] {
  return formed(
    numberedNames([
      fighterFrom(setup.player, 'player', true),
      ...setup.allies.map((a) => fighterFrom(a, 'player')),
      ...setup.enemies.map((e) => fighterFrom(e, 'enemy')),
    ]),
  );
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
      | 'reactions'
      | 'keepAt'
      | 'holdOff'
      | 'movedAt'
      | 'streak'
      | 'hidden'
      | 'confused'
      | 'concealment'
      | 'perks'
      | 'openUntil'
      | 'steadyUntil'
      | 'trumpsUsed'
      | 'substituteSpent'
      | 'stance'
      | 'joined'
      | 'used'
      | 'chakraSpent'
      | 'clones'
      | 'blows'
      | 'footwork'
      | 'secondWindSpent'
      | 'fellAt'
      | 'dazedBy'
      | 'guardBrokenBy'
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
