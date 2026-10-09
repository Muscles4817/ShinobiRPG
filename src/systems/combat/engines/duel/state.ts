import type {
  CombatAttributes,
  CombatantSetup,
  CombatResult,
  CombatSetup,
  CombatState,
  CombatTechnique,
} from '../../contract';

export const DUEL_ENGINE_ID = 'duel-v1';
export const LOG_LIMIT = 40;

export interface Fighter {
  readonly id: string;
  readonly name: string;
  readonly isPlayer: boolean;
  readonly attributes: CombatAttributes;
  readonly health: number;
  readonly maxHealth: number;
  readonly chakra: number;
  readonly maxChakra: number;
  readonly techniques: readonly CombatTechnique[];
  /** Turns of action this fighter will lose. */
  readonly stunned: number;
  readonly guarding: boolean;
}

export interface DuelState {
  readonly round: number;
  readonly fighters: readonly Fighter[];
  readonly log: readonly string[];
  readonly result: CombatResult | null;
  readonly canFlee: boolean;
}

function toFighter(setup: CombatantSetup, isPlayer: boolean): Fighter {
  return { ...setup, isPlayer, stunned: 0, guarding: false };
}

export function initialDuel(setup: CombatSetup): DuelState {
  const names = setup.enemies.map((e) => e.name).join(' and ');
  return {
    round: 1,
    fighters: [toFighter(setup.player, true), ...setup.enemies.map((e) => toFighter(e, false))],
    log: [`${names} stand${setup.enemies.length > 1 ? '' : 's'} against you!`],
    result: null,
    canFlee: setup.canFlee,
  };
}

export function encode(state: DuelState): CombatState {
  return { engineId: DUEL_ENGINE_ID, data: state };
}

/** Recovers duel state from the opaque contract type. Only this engine may do this. */
export function decode(state: CombatState): DuelState {
  if (state.engineId !== DUEL_ENGINE_ID) {
    throw new Error(`Duel engine cannot read combat state from engine "${state.engineId}"`);
  }
  return state.data as DuelState;
}

export function playerOf(state: DuelState): Fighter {
  const player = state.fighters.find((f) => f.isPlayer);
  if (!player) throw new Error('Duel state has no player');
  return player;
}

export function livingEnemies(state: DuelState): Fighter[] {
  return state.fighters.filter((f) => !f.isPlayer && f.health > 0);
}

export function isAlive(f: Fighter): boolean {
  return f.health > 0;
}
