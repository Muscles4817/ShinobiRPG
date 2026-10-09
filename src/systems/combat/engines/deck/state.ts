import type {
  CombatResult,
  CombatSetup,
  CombatState,
  CombatTechnique,
  RangeBand,
} from '../../contract';
import { bodyFrom, type Body } from '../../rules/body';

export const DECK_ENGINE_ID = 'deck-v1';
export const LOG_LIMIT = 40;
export const HAND_SIZE = 5;
export const POINTS_PER_TURN = 3;

export type CardKind = 'strike' | 'kunai' | 'guard' | 'jutsu';

export interface Card {
  /** Unique within the fight, so two Strikes in hand are different cards. */
  readonly uid: string;
  readonly kind: CardKind;
  readonly technique?: CombatTechnique;
}

export interface DeckFighter extends Body {
  /** Damage absorbed before health; resets at the start of the fighter's own turn. */
  readonly block: number;
  readonly stunned: number;
  readonly sealed: number;
}

/** What an enemy will do on its next turn, shown to the player in advance. */
export interface Intent {
  readonly kind: 'attack' | 'jutsu' | 'guard' | 'step-in' | 'step-back' | 'dazed';
  readonly technique?: CombatTechnique;
  /** Rough damage, for attack and jutsu intents. */
  readonly estimate: number;
}

export interface DeckState {
  readonly round: number;
  readonly fighters: readonly DeckFighter[];
  readonly range: RangeBand;
  readonly drawPile: readonly Card[];
  readonly hand: readonly Card[];
  readonly discard: readonly Card[];
  /** Action points left this turn. */
  readonly points: number;
  readonly intents: Readonly<Record<string, Intent>>;
  readonly log: readonly string[];
  readonly result: CombatResult | null;
  readonly canFlee: boolean;
}

function fighterFrom(setup: CombatSetup['player'], side: 'player' | 'enemy', isPlayer = false) {
  return { ...bodyFrom(setup, side, isPlayer), block: 0, stunned: 0, sealed: 0 };
}

export function initialFighters(setup: CombatSetup): DeckFighter[] {
  return [
    fighterFrom(setup.player, 'player', true),
    ...setup.allies.map((a) => fighterFrom(a, 'player')),
    ...setup.enemies.map((e) => fighterFrom(e, 'enemy')),
  ];
}

export function encode(state: DeckState): CombatState {
  return { engineId: DECK_ENGINE_ID, data: state };
}

/** Recovers deck state from the opaque contract type. Only this engine may do this. */
export function decode(state: CombatState): DeckState {
  if (state.engineId !== DECK_ENGINE_ID) {
    throw new Error(`Deck engine cannot read combat state from engine "${state.engineId}"`);
  }
  return state.data as DeckState;
}

export function playerOf(state: Pick<DeckState, 'fighters'>): DeckFighter {
  const player = state.fighters.find((f) => f.isPlayer);
  if (!player) throw new Error('Deck state has no player');
  return player;
}

export function patch(
  fighters: readonly DeckFighter[],
  id: string,
  change: Partial<Pick<DeckFighter, 'health' | 'chakra' | 'block' | 'stunned' | 'sealed'>>,
): DeckFighter[] {
  return fighters.map((f) => (f.id === id ? { ...f, ...change } : f));
}

/** Damage soaks into block first. */
export function absorb(target: DeckFighter, damage: number): Pick<DeckFighter, 'health' | 'block'> {
  const soaked = Math.min(target.block, damage);
  return { block: target.block - soaked, health: Math.max(0, target.health - (damage - soaked)) };
}
