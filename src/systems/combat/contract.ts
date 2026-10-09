import type { Result, Rng } from '@/core';
import type { Stats } from '@/systems/stats';
import type { TechniqueDef } from '@/systems/techniques';

/**
 * THE COMBAT CONTRACT
 *
 * Everything outside `systems/combat` talks to combat exclusively through these types.
 * To replace the combat engine, write a new `CombatEngine` implementation and swap it
 * in at the composition root (`src/game/context.ts`). Nothing else needs to change:
 *  - the game layer only builds a `CombatSetup` and reads a `CombatOutcome`;
 *  - the UI only renders a `CombatView` and sends back an option id;
 *  - saves store the engine's `CombatState` as an opaque blob.
 */

/** The subset of character stats combat is allowed to use. */
export type CombatAttributes = Pick<
  Stats,
  | 'strength'
  | 'speed'
  | 'stamina'
  | 'perception'
  | 'willpower'
  | 'taijutsu'
  | 'ninjutsu'
  | 'genjutsu'
  | 'kenjutsu'
  | 'fuuinjutsu'
>;

export type CombatTechnique = Pick<
  TechniqueDef,
  'id' | 'name' | 'discipline' | 'effect' | 'chakraCost' | 'power'
>;

export interface CombatantSetup {
  readonly id: string;
  readonly name: string;
  /** Short descriptor such as "Spirit" or "Bandit", shown on the combatant's banner. */
  readonly tag?: string;
  readonly attributes: CombatAttributes;
  readonly health: number;
  readonly maxHealth: number;
  readonly chakra: number;
  readonly maxChakra: number;
  readonly techniques: readonly CombatTechnique[];
}

export interface CombatSetup {
  readonly player: CombatantSetup;
  readonly enemies: readonly CombatantSetup[];
  readonly canFlee: boolean;
}

/**
 * Engine-owned state. Must be JSON-serialisable (it is saved mid-fight).
 * Only the engine that created it may look inside `data`.
 */
export interface CombatState {
  readonly engineId: string;
  readonly data: unknown;
}

export type CombatSide = 'player' | 'enemy';

export interface CombatantView {
  readonly id: string;
  readonly name: string;
  readonly tag?: string;
  readonly side: CombatSide;
  readonly health: number;
  readonly maxHealth: number;
  readonly chakra: number;
  readonly maxChakra: number;
  /** Short human-readable conditions, e.g. "Dazed", "Guarding". */
  readonly statuses: readonly string[];
}

/** A choice the player can make this turn. `id` is passed back to `act`. */
export interface CombatOption {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  /** Lets the UI present options differently: techniques as cards, escape apart. */
  readonly kind: 'basic' | 'technique' | 'escape';
  readonly discipline?: TechniqueDef['discipline'];
  /** Present when the option is shown but cannot be chosen right now. */
  readonly disabledReason?: string;
}

export interface CombatView {
  readonly round: number;
  readonly combatants: readonly CombatantView[];
  /** Narration, oldest first. */
  readonly log: readonly string[];
  readonly options: readonly CombatOption[];
}

export type CombatResult = 'victory' | 'defeat' | 'escaped';

export interface CombatOutcome {
  readonly result: CombatResult;
  readonly rounds: number;
  /** The player's condition after the fight, to be written back to their vitals. */
  readonly player: { readonly health: number; readonly chakra: number };
}

export interface CombatEngine {
  readonly id: string;
  start(setup: CombatSetup, rng: Rng): CombatState;
  /** Performs the player's chosen option (and whatever the opponents do in response). */
  act(state: CombatState, optionId: string, rng: Rng): Result<CombatState>;
  view(state: CombatState): CombatView;
  /** Null while the fight is still going. */
  outcome(state: CombatState): CombatOutcome | null;
}
