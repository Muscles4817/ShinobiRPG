import type {
  CombatAttributes,
  CombatantSetup,
  CombatItem,
  CombatPerk,
  CombatResult,
  CombatSetup,
  CombatSide,
  CombatState,
  CombatTechnique,
  CombatTrait,
} from '../../contract';
import { startsHidden } from '../../rules/conditions';
import { hasTrait } from '../../rules/kit';

export const DUEL_ENGINE_ID = 'duel-v1';
export const LOG_LIMIT = 40;

export interface Fighter {
  readonly id: string;
  readonly name: string;
  readonly tag?: string;
  readonly isPlayer: boolean;
  readonly side: CombatSide;
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
  readonly perks: readonly CombatPerk[];
  readonly traits: readonly CombatTrait[];
  /** Hidden in an illusion: can't be targeted until found. */
  readonly hidden: boolean;
  /** Turns of confusion left: the player's attacks may misfire. */
  readonly confused: number;
  /**
   * Standing back from the fray. Blows and blades only reach between two fighters who are
   * both engaged; archers start distant.
   */
  readonly distant: boolean;
  /** Tools still in the pouch (only the player carries any). */
  readonly items: readonly CombatItem[];
}

/** Fields that saves from before allies (side), combat kits or fight tools lack. */
type AddedLater = 'side' | 'perks' | 'traits' | 'hidden' | 'confused' | 'distant' | 'items';
type StoredFighter = Omit<Fighter, AddedLater> & Partial<Pick<Fighter, AddedLater>>;

export interface DuelState {
  readonly round: number;
  readonly fighters: readonly Fighter[];
  readonly log: readonly string[];
  readonly result: CombatResult | null;
  readonly canFlee: boolean;
}

function toFighter(setup: CombatantSetup, side: CombatSide, isPlayer = false): Fighter {
  const traits = setup.traits ?? [];
  return {
    ...setup,
    isPlayer,
    side,
    stunned: 0,
    guarding: false,
    perks: setup.perks ?? [],
    traits,
    hidden: startsHidden({ traits }),
    confused: 0,
    distant: hasTrait({ traits }, 'archer'),
    items: setup.items ?? [],
  };
}

/** Old saves: the player alone on their side, nobody kitted, hidden, standing back or carrying tools. */
function withDefaults(f: StoredFighter): Fighter {
  return {
    ...f,
    side: f.side ?? (f.isPlayer ? 'player' : 'enemy'),
    perks: f.perks ?? [],
    traits: f.traits ?? [],
    hidden: f.hidden ?? false,
    confused: f.confused ?? 0,
    distant: f.distant ?? false,
    items: f.items ?? [],
  };
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
  // Trust boundary: only this engine writes duel state, but older versions wrote less of it.
  const stored = state.data as Omit<DuelState, 'fighters'> & {
    readonly fighters: readonly StoredFighter[];
  };
  return { ...stored, fighters: stored.fighters.map(withDefaults) };
}

export function playerOf(state: DuelState): Fighter {
  const player = state.fighters.find((f) => f.isPlayer);
  if (!player) throw new Error('Duel state has no player');
  return player;
}

/** Living fighters on one side. */
export function livingOn(fighters: readonly Fighter[], side: CombatSide): Fighter[] {
  return fighters.filter((f) => f.side === side && f.health > 0);
}

export function livingEnemies(state: DuelState): Fighter[] {
  return livingOn(state.fighters, 'enemy');
}

export function isAlive(f: Fighter): boolean {
  return f.health > 0;
}
