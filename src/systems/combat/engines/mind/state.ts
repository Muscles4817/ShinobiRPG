import type {
  CombatItem,
  CombatResult,
  CombatSetup,
  CombatState,
  CombatTechnique,
  RangeBand,
} from '../../contract';
import { bodyFrom, withKit, type Body } from '../../rules/body';

export const MIND_ENGINE_ID = 'mind-v1';
export const LOG_LIMIT = 40;

/** What a fighter commits to for one exchange. */
export type MoveKind =
  | 'strike'
  | 'throw'
  | 'feint'
  | 'guard'
  | 'counter'
  | 'jutsu'
  | 'step-in'
  | 'step-back'
  | 'search'
  | 'dispel'
  | 'item'
  | 'idle';

export interface Move {
  readonly kind: MoveKind;
  readonly technique?: CombatTechnique;
  /** The tool used, for an `item` move (only the player has any). */
  readonly item?: CombatItem;
}

export interface MindFighter extends Body {
  /** Exchanges this fighter will sit out. */
  readonly stunned: number;
  /** Rounds this fighter can't use techniques. */
  readonly sealed: number;
  /** Caught out by a feint: the next blow against them lands harder. */
  readonly opened: boolean;
}

/** An enemy's committed move and the tell it shows the player. */
export interface EnemyPlan {
  readonly move: Move;
  readonly tell: string;
  /** Whether the tell matches the move; never shown to the player. */
  readonly honest: boolean;
  /** True when the player can read this enemy perfectly (insight). */
  readonly certain: boolean;
}

export interface MindState {
  readonly round: number;
  readonly fighters: readonly MindFighter[];
  readonly range: RangeBand;
  readonly plans: Readonly<Record<string, EnemyPlan>>;
  readonly log: readonly string[];
  readonly result: CombatResult | null;
  readonly canFlee: boolean;
}

function fighterFrom(setup: CombatSetup['player'], side: 'player' | 'enemy', isPlayer = false) {
  return { ...bodyFrom(setup, side, isPlayer), stunned: 0, sealed: 0, opened: false };
}

export function initialFighters(setup: CombatSetup): MindFighter[] {
  return [
    fighterFrom(setup.player, 'player', true),
    ...setup.allies.map((a) => fighterFrom(a, 'player')),
    ...setup.enemies.map((e) => fighterFrom(e, 'enemy')),
  ];
}

export function encode(state: MindState): CombatState {
  return { engineId: MIND_ENGINE_ID, data: state };
}

/** A fighter as saved before combat kits and tools: no traits, hidden, confused or items. */
type KitField = 'traits' | 'hidden' | 'confused' | 'items';
type SavedFighter = Omit<MindFighter, KitField> & Partial<Pick<MindFighter, KitField>>;

/** Recovers mind-game state from the opaque contract type. Only this engine may do this. */
export function decode(state: CombatState): MindState {
  if (state.engineId !== MIND_ENGINE_ID) {
    throw new Error(`Mind engine cannot read combat state from engine "${state.engineId}"`);
  }
  // Trust boundary: the data is this engine's own saved state, possibly from an older version.
  const saved = state.data as Omit<MindState, 'fighters'> & {
    readonly fighters: readonly SavedFighter[];
  };
  return { ...saved, fighters: saved.fighters.map((f) => withKit(f)) };
}

export function playerOf(state: Pick<MindState, 'fighters'>): MindFighter {
  const player = state.fighters.find((f) => f.isPlayer);
  if (!player) throw new Error('Mind state has no player');
  return player;
}

export function patch(
  fighters: readonly MindFighter[],
  id: string,
  change: Partial<
    Pick<MindFighter, 'health' | 'chakra' | 'stunned' | 'sealed' | 'opened' | 'hidden' | 'confused'>
  >,
): MindFighter[] {
  return fighters.map((f) => (f.id === id ? { ...f, ...change } : f));
}
