import type { CombatResult, CombatSetup, CombatState, RangeBand } from '../../contract';
import { bodyFrom, type Body } from '../../rules/body';

export const PLAN_ENGINE_ID = 'plan-v1';
export const LOG_LIMIT = 60;

/** A card slotted for one distance: a basic, a footwork card, a defence, or `jutsu:<id>`. */
export type CardId = string;

/** The cards a fighter brings to each distance. */
export type Loadout = Readonly<Record<RangeBand, readonly CardId[]>>;

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
  readonly log: readonly string[];
  readonly result: CombatResult | null;
  readonly canFlee: boolean;
}

/** One exchange in progress. */
export interface Round {
  /** The exchange number (`PlanState.round`), which decides when illusionists slip away. */
  readonly number: number;
  readonly fighters: PlanFighter[];
  readonly range: RangeBand;
  readonly lines: readonly string[];
  readonly seen: PlanState['seen'];
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
