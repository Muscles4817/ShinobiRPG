import type {
  CombatAttributes,
  CombatantSetup,
  CombatResult,
  CombatSetup,
  CombatSide,
  CombatState,
  CombatTechnique,
} from '../../contract';

export const DUEL_ENGINE_ID = 'duel-v1';
export const LOG_LIMIT = 40;

export interface Fighter {
  readonly id: string;
  readonly name: string;
  readonly tag?: string;
  readonly isPlayer: boolean;
  /** Absent in saves from before allies existed: then the player alone is on their side. */
  readonly side?: CombatSide;
  readonly attributes: CombatAttributes;
  readonly health: number;
  readonly maxHealth: number;
  readonly chakra: number;
  readonly maxChakra: number;
  readonly techniques: readonly CombatTechnique[];
  /** Turns of action this fighter will lose. */
  readonly stunned: number;
  /** Rounds this fighter can't use techniques. Absent in saves from before seals existed. */
  readonly sealed?: number;
  readonly guarding: boolean;
}

export interface DuelState {
  readonly round: number;
  readonly fighters: readonly Fighter[];
  readonly log: readonly string[];
  readonly result: CombatResult | null;
  readonly canFlee: boolean;
}

function toFighter(setup: CombatantSetup, side: CombatSide, isPlayer = false): Fighter {
  return { ...setup, isPlayer, side, stunned: 0, guarding: false };
}

/** "A", "A and B", "A, B and C". */
function listNames(names: readonly string[]): string {
  const last = names.at(-1) ?? '';
  return names.length <= 1 ? last : `${names.slice(0, -1).join(', ')} and ${last}`;
}

function defaultIntro(setup: CombatSetup): string {
  const names = listNames(setup.enemies.map((e) => e.name));
  const against = `${names} stand${setup.enemies.length > 1 ? '' : 's'} against you!`;
  return setup.allies.length > 0 ? `${against} Your team closes ranks.` : against;
}

export function initialDuel(setup: CombatSetup): DuelState {
  return {
    round: 1,
    fighters: [
      toFighter(setup.player, 'player', true),
      ...setup.allies.map((a) => toFighter(a, 'player')),
      ...setup.enemies.map((e) => toFighter(e, 'enemy')),
    ],
    log: [setup.intro ?? defaultIntro(setup)],
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

export function sideOf(f: Fighter): CombatSide {
  return f.side ?? (f.isPlayer ? 'player' : 'enemy');
}

/** Living fighters on one side. */
export function livingOn(fighters: readonly Fighter[], side: CombatSide): Fighter[] {
  return fighters.filter((f) => sideOf(f) === side && f.health > 0);
}

export function livingEnemies(state: DuelState): Fighter[] {
  return livingOn(state.fighters, 'enemy');
}

export function isAlive(f: Fighter): boolean {
  return f.health > 0;
}
