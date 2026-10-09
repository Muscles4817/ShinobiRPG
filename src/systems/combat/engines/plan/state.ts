import type { CombatResult, CombatSetup, CombatState, RangeBand } from '../../contract';
import { bodyFrom, type Body } from '../../rules/body';

export const PLAN_ENGINE_ID = 'plan-v1';
export const LOG_LIMIT = 60;

export type TacticId = 'rush' | 'technician' | 'patient' | 'trickster';

/** When a rule applies. */
export type Condition =
  'always' | 'out-of-position' | 'low-health' | 'enemy-dazed' | 'enemy-fresh' | 'chakra-high';

/** What a rule does. Technique picks are resolved against what the fighter knows. */
export type PlanAction =
  'move' | 'strongest' | 'physical-technique' | 'stun' | 'heal' | 'guard' | 'attack';

export interface Rule {
  readonly when: Condition;
  readonly then: PlanAction;
}

export interface PlanFighter extends Body {
  readonly stunned: number;
  readonly sealed: number;
  readonly guarding: boolean;
}

export interface PlanState {
  /** Choosing a tactic, then watching it play out. */
  readonly phase: 'plan' | 'fight';
  readonly tactic: TacticId | null;
  readonly round: number;
  readonly fighters: readonly PlanFighter[];
  readonly range: RangeBand;
  readonly trumpUsed: boolean;
  readonly log: readonly string[];
  readonly result: CombatResult | null;
  readonly canFlee: boolean;
}

function fighterFrom(setup: CombatSetup['player'], side: 'player' | 'enemy', isPlayer = false) {
  return { ...bodyFrom(setup, side, isPlayer), stunned: 0, sealed: 0, guarding: false };
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
  change: Partial<Pick<PlanFighter, 'health' | 'chakra' | 'stunned' | 'sealed' | 'guarding'>>,
): PlanFighter[] {
  return fighters.map((f) => (f.id === id ? { ...f, ...change } : f));
}
