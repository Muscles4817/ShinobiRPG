import type { Result, Rng } from '@/core';
import type { Stats } from '@/systems/stats';
import type { Element, TechniqueDef } from '@/systems/techniques';

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
  | 'chakraControl'
  | 'intellect'
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
  'id' | 'name' | 'discipline' | 'element' | 'effect' | 'chakraCost' | 'power'
>;

/** How far apart the two sides stand. Engines decide what each band allows. */
export type RangeBand = 'close' | 'mid' | 'far';

/**
 * Special abilities a combatant brings, e.g. an awakened bloodline's eyes. Engines that
 * don't know a perk ignore it.
 */
export type CombatPerk = 'insight';

/**
 * How a combatant fights, beyond their numbers. Every engine honours the same traits (see
 * `rules/kit.ts` and `rules/conditions.ts`), so an archer is an archer in every fight style.
 */
export const COMBAT_TRAITS = [
  'archer',
  'brawler',
  'illusionist',
  'armoured',
  'swift',
  'pack',
  'coward',
  'spirit',
] as const;
export type CombatTrait = (typeof COMBAT_TRAITS)[number];

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
  /** Chakra nature: boosts techniques of the same element and decides elemental matchups. */
  readonly nature?: Element;
  readonly perks?: readonly CombatPerk[];
  readonly traits?: readonly CombatTrait[];
}

export interface CombatSetup {
  readonly player: CombatantSetup;
  /** Fighters on the player's side, acting on their own. */
  readonly allies: readonly CombatantSetup[];
  readonly enemies: readonly CombatantSetup[];
  readonly canFlee: boolean;
  /** Opening line of the fight; the engine words one when absent. */
  readonly intro?: string;
  /**
   * The player's plan from their last fight in this engine, exactly as the engine handed it
   * back in `CombatOutcome.plan`. Opaque to the game; the engine must validate it.
   */
  readonly plan?: unknown;
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
  /** What they seem about to do (a telegraph or tell), when the engine shows one. */
  readonly intent?: string;
  /** False while they can't be picked as a target (hidden in an illusion). */
  readonly targetable?: boolean;
}

/** A resource the engine wants shown (action points, momentum, block…). */
export interface CombatMeter {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly max: number;
}

/** A choice the player can make this turn. `id` is passed back to `act`. */
export interface CombatOption {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  /**
   * Lets the UI present options differently: basics and techniques as cards in the hand,
   * moves (stepping in or back) as small buttons, plans as a list to pick from, continue and
   * end-turn in the choice bar, escape apart.
   */
  readonly kind: 'basic' | 'technique' | 'move' | 'plan' | 'continue' | 'end' | 'escape';
  readonly discipline?: TechniqueDef['discipline'];
  /** Points spent from a per-turn budget, for engines that have one. */
  readonly cost?: number;
  /** Aimed at one enemy: the UI sends the chosen target with it. */
  readonly targeted?: boolean;
  /** Plans that are set up in parts (e.g. cards per range) say which part this belongs to. */
  readonly group?: string;
  /** For toggles: whether this is currently part of the plan. */
  readonly selected?: boolean;
  /** Present when the option is shown but cannot be chosen right now. */
  readonly disabledReason?: string;
}

export interface CombatView {
  readonly round: number;
  readonly combatants: readonly CombatantView[];
  /** Narration, oldest first. */
  readonly log: readonly string[];
  readonly options: readonly CombatOption[];
  /** Current distance, for engines that track range. */
  readonly range?: RangeBand;
  /** One line telling the player what to do now, e.g. "Pick your cards". */
  readonly prompt?: string;
  readonly meters?: readonly CombatMeter[];
}

/** What the player chose: an option and, for targeted options, which enemy. */
export interface CombatChoice {
  readonly optionId: string;
  readonly targetId?: string;
}

export type CombatResult = 'victory' | 'defeat' | 'escaped';

export interface CombatOutcome {
  readonly result: CombatResult;
  readonly rounds: number;
  /** The player's condition after the fight, to be written back to their vitals. */
  readonly player: { readonly health: number; readonly chakra: number };
  /** Anything the player set up that should carry over to their next fight (JSON-safe). */
  readonly plan?: unknown;
}

export interface CombatEngine {
  readonly id: string;
  /** Shown when choosing a fight style, e.g. "Deck". */
  readonly label: string;
  readonly summary: string;
  start(setup: CombatSetup, rng: Rng): CombatState;
  /** Performs the player's choice (and whatever the opponents do in response). */
  act(state: CombatState, choice: CombatChoice, rng: Rng): Result<CombatState>;
  view(state: CombatState): CombatView;
  /** Null while the fight is still going. */
  outcome(state: CombatState): CombatOutcome | null;
}
