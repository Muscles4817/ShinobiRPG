import type { Grammar, Result, Rng } from '@/core';
import type { Stats } from '@/systems/stats';
import type { CostTemplate, Element, FieldId, TechniqueDef } from '@/systems/techniques';

import type { CombatGear, CombatItem } from './gearContract';
import type { CombatDust } from './dustContract';
import type { CombatGround } from './groundContract';
import type { CombatSwarm } from './swarmContract';
import type { CombatOrders, CombatStance, CombatUsage } from './teamContract';

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
  | 'id'
  | 'name'
  | 'discipline'
  | 'element'
  | 'effects'
  | 'chakraCost'
  | 'swarmCost'
  | 'dustCost'
  | 'dustDraw'
  | 'oncePerFight'
  | 'afterCost'
  | 'combo'
  | 'needs'
  | 'reach'
  | 'accuracy'
  | 'needsOpen'
  | 'needsTarget'
  | 'moulded'
  | 'clan'
> & {
  /** Learned a rank above its user's grade: costlier and may misfire (`rules/unstable.ts`). */
  readonly unstable?: true;
  /** Its rank, which reads its power (`rules/damage.ts`); E when a bare setup leaves it out. */
  readonly rank?: TechniqueDef['rank'];
};

/** How far apart the two sides stand. Engines decide what each band allows. */
export type RangeBand = 'close' | 'mid' | 'far';

/**
 * Where a fighter stands in their side's formation. The back row can't be struck up close
 * while someone stands in front of it (see `rules/rows.ts`); engines without rows ignore it.
 */
export type CombatRow = 'front' | 'back';

// Fight tools are part of what a fighter carries in (`gearContract.ts`).
export { COMBAT_ITEM_EFFECTS, type CombatItem, type CombatItemEffect } from './gearContract';

/**
 * Special abilities a combatant brings: an awakened bloodline's eyes (`insight` reads every foe
 * and card, `foresight` reads movement before it happens, `mimicry` copies techniques watched;
 * `rules/eyes.ts`), or walking on water or up trees with chakra (which keep their footing on a lake, or the trees in a forest; see
 * `rules/ground.ts`). Engines ignore what they don't use.
 */
export type CombatPerk = 'insight' | 'foresight' | 'mimicry' | 'water-walking' | 'tree-walking';

export { COMBAT_GROUNDS, type CombatGround } from './groundContract';

/**
 * What a fight is, for its story only (`engines/plan/scene.ts`): a friendly spar, a spar with a
 * teammate, one with your rival, or a bout before a proctor. Absent: a fight for real. Rules
 * never read it; it decides how a fall or the end is told, never whether they happen.
 */
export const COMBAT_OCCASIONS = ['spar', 'teammate', 'rival', 'bout'] as const;
export type CombatOccasion = (typeof COMBAT_OCCASIONS)[number];

/**
 * What a fighter is, for the story's words only: a person, a beast that bites and claws, a
 * swarm that stings, a spirit that touches rather than strikes. Absent: a spirit if it has the
 * `spirit` trait, a beast if the story calls it "it", otherwise a person.
 */
export const COMBAT_FORMS = ['person', 'beast', 'swarm', 'spirit'] as const;
export type CombatForm = (typeof COMBAT_FORMS)[number];

/**
 * What a good meal brings into a fight (`rules/provisions.ts`): chakra topped up, a steady
 * opening, harms that wear off sooner, a second wind. Never a stat.
 */
export const COMBAT_PROVISIONS = ['fortified', 'steady', 'antidote', 'second-wind'] as const;
export type CombatProvision = (typeof COMBAT_PROVISIONS)[number];

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

/**
 * How the fight's story speaks of a fighter: the player as "you", people by their pronouns,
 * creatures and spirits as "it". Absent: "they".
 */
export type CombatGrammar = Grammar;

/** How big a body is: a bred size, or one a technique makes for a while. */
export type BodySize = 'small' | 'human' | 'large' | 'huge';

export interface CombatantSetup {
  readonly id: string;
  readonly name: string;
  /**
   * What the story calls them mid-sentence: "you", "Gōran", "the storehouse wraith". Absent:
   * their name. Banners always show `name`.
   */
  readonly called?: string;
  /** How the story's pronouns and verbs agree with them; absent: "they". */
  readonly grammar?: CombatGrammar;
  /** Short descriptor such as "Spirit" or "Bandit", shown on the combatant's banner. */
  readonly tag?: string;
  /** What they are, for the story's words (`CombatForm`); absent: read from traits and grammar. */
  readonly form?: CombatForm;
  /** What the story calls their plain strike ("tusk", "claw"); absent: their form's word. */
  readonly blow?: string;
  readonly attributes: CombatAttributes;
  readonly health: number;
  readonly maxHealth: number;
  readonly chakra: number;
  readonly maxChakra: number;
  readonly techniques: readonly CombatTechnique[];
  /** Chakra nature: boosts techniques of the same element and decides elemental matchups. */
  readonly nature?: Element;
  readonly perks?: readonly CombatPerk[];
  /**
   * Perks kept covered until revealed in the fight (a transplanted eye under a headband): no use
   * until uncovered, and a drain on chakra while open (`rules/veil.ts`).
   */
  readonly veiled?: readonly CombatPerk[];
  readonly traits?: readonly CombatTrait[];
  /** Tools carried into the fight (the player's pouch). */
  readonly items?: readonly CombatItem[];
  /**
   * The body moves (technique ids) a plain strike plays from, as the fighter chose them; absent,
   * the engine keeps their best (`engines/plan/repertoire.ts`).
   */
  readonly repertoire?: readonly string[];
  /**
   * The chains (technique ids, opener first) the fighter keeps ready, as they built them; absent,
   * the engine builds them from their moves (`rules/chains.ts`).
   */
  readonly chains?: readonly (readonly string[])[];
  /** Equipped gear (see `gearContract.ts`); absent for fighters armed as their kit suggests. */
  readonly gear?: CombatGear;
  /** What today's meal brings into the fight (the player's). */
  readonly provisions?: readonly CombatProvision[];
  /** A preferred row; when absent the engine places the fighter by their kit. */
  readonly row?: CombatRow;
  /**
   * A body bigger (or smaller) than a human's (`rules/size.ts`); human when absent. Health is
   * given on the human scale and scaled by the engine, and reported back on it.
   */
  readonly size?: BodySize;
  /** An ally's stance; when absent the engine picks one from their kit. */
  readonly stance?: CombatStance;
  /** What the player may change about this ally (see `teamContract.ts`). */
  readonly orders?: CombatOrders;
  /** Bodies they can call into the fight with a summoning technique (the `summon` verb). */
  readonly calls?: readonly CombatCall[];
  /** The hive in their body (`swarmContract.ts`). */
  readonly swarm?: CombatSwarm;
  /** The dust they command and carry (`dustContract.ts`). */
  readonly dust?: CombatDust;
}

/**
 * A summon a fighter can call (`docs/design/retinue-plan.md`): the body that answers, by the id
 * a technique's `summon` effect names. It fights by its own mind on its caller's side, and its
 * caller pays its upkeep in chakra at the end of every exchange it stays; it goes home when they
 * can't, when it falls, or when they do. Some ask blood too, paid from the caller's health.
 */
export interface CombatCall {
  readonly id: string;
  readonly body: CombatantSetup;
  readonly upkeep: number;
  readonly bloodPrice?: number;
  /** A puppet: built and worked on threads, not summoned (it unfolds and falls apart). */
  readonly puppet?: true;
}

/** How a summon's part in a fight ended: still there, beaten, or sent home unpaid. */
export const SUMMON_FATES = ['stayed', 'fell', 'sent-home'] as const;
export type SummonFate = (typeof SUMMON_FATES)[number];

/**
 * A field already over the ground when the fight opens (the player set the ground with mist):
 * which field, the side it favours, and its potency (perception above it sees through).
 */
export interface CombatOpeningField {
  readonly id: FieldId;
  readonly side: CombatSide;
  readonly potency: number;
}

/**
 * How the fight begins, when what came before it (an ambush, a chase, recon) shaped it: the
 * starting distance, fighters (by id) who start hidden or reel through the first exchange,
 * which side moved first and so acts first in it, and a field in place. Absent: a plain
 * head-on fight.
 */
export interface CombatOpening {
  readonly range?: RangeBand;
  readonly hidden?: readonly string[];
  readonly dazed?: readonly string[];
  readonly firstMover?: CombatSide;
  readonly field?: CombatOpeningField;
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
  readonly opening?: CombatOpening;
  /** Where it happens; an open arena when absent. */
  readonly ground?: CombatGround;
  /** What kind of fight it is, for its telling only; a fight for real when absent. */
  readonly occasion?: CombatOccasion;
  /**
   * The player only watches: their side fights on its own, as the foes do, and the fight plays
   * on round after round with no planning between. Engines that can't stage a fight ignore it.
   */
  readonly watch?: boolean;
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
  /** Their row, for engines with formations. */
  readonly row?: CombatRow;
  /** Pools of their own besides health and chakra (breath, a hive, dust), when they have any. */
  readonly meters?: readonly CombatMeter[];
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
   * moves (stepping in or back) as small buttons, tools from the pouch as their own row, plans as
   * a list to pick from, orders to the team (stances, the mark) as pickers, continue and
   * end-turn in the choice bar, escape apart.
   */
  readonly kind:
    'basic' | 'technique' | 'move' | 'item' | 'plan' | 'order' | 'continue' | 'end' | 'escape';
  readonly discipline?: TechniqueDef['discipline'];
  /** The technique this option plays, so a view can show its sheet. */
  readonly techniqueId?: string;
  /** Points spent from a per-turn budget, for engines that have one. */
  readonly cost?: number;
  /** Aimed at one enemy: the UI sends the chosen target with it. */
  readonly targeted?: boolean;
  /** Plans that are set up in parts (e.g. cards per range) say which part this belongs to. */
  readonly group?: string;
  /** A plan option for a teammate's cards: whose (a combatant id). Absent for your own. */
  readonly owner?: string;
  /** For toggles: whether this is currently part of the plan. */
  readonly selected?: boolean;
  /** For plans kept in priority order: this entry's place in its group, 0 coming first. */
  readonly rank?: number;
  /**
   * Set on an option that adjusts another plan entry (moves it up, or sets how it plays): the
   * id of the entry it adjusts. Adjustments to one entry that share a `setting` are
   * alternatives, and `selected` marks the current one; a setting with a single option is an
   * action (e.g. "Move up").
   */
  readonly adjusts?: string;
  /** What an adjustment sets, e.g. "When" or "Target"; shown as the control's label. */
  readonly setting?: string;
  /** Present when the option is shown but cannot be chosen right now. */
  readonly disabledReason?: string;
}

export interface CombatView {
  readonly round: number;
  readonly combatants: readonly CombatantView[];
  /** Narration, oldest first. */
  readonly log: readonly string[];
  /**
   * How many earlier lines the engine has let go (it keeps only the latest), so a line's place
   * in the whole story is `logOffset` plus its index. Absent: none dropped.
   */
  readonly logOffset?: number;
  readonly options: readonly CombatOption[];
  /** Current distance, for engines that track range. */
  readonly range?: RangeBand;
  /** One line telling the player what to do now, e.g. "Pick your cards". */
  readonly prompt?: string;
  readonly meters?: readonly CombatMeter[];
  /** The player only watches (`CombatSetup.watch`): nothing is aimed at "you". */
  readonly watched?: true;
}

/** What the player chose: an option and, for targeted options, which enemy. */
export interface CombatChoice {
  readonly optionId: string;
  readonly targetId?: string;
}

export type CombatResult = 'victory' | 'defeat' | 'escaped';

/** A price the player paid for a trump card they used in the fight, due once it is over. */
export interface CombatCost {
  readonly techniqueId: string;
  readonly techniqueName: string;
  readonly cost: CostTemplate;
}

export interface CombatOutcome {
  readonly result: CombatResult;
  readonly rounds: number;
  /** The player's condition after the fight, to be written back to their vitals. */
  readonly player: { readonly health: number; readonly chakra: number };
  /** Tools left in the player's pouch, by item id; absent from engines that predate tools. */
  readonly items?: Readonly<Record<string, number>>;
  /** Anything the player set up that should carry over to their next fight (JSON-safe). */
  readonly plan?: unknown;
  /** Trump costs the player incurred, one per trump used; absent from engines without trumps. */
  readonly costs?: readonly CombatCost[];
  /** Chakra the player paid during the fight (it deepens reserves); absent from older engines. */
  readonly chakraSpent?: number;
  /** What each fighter used, by combatant id; absent from engines that don't track it. */
  readonly used?: Readonly<Record<string, CombatUsage>>;
  /** Each fighter on the player's side but the player, as they end it (by combatant id). */
  readonly allies?: Readonly<Record<string, { readonly health: number }>>;
  /**
   * The fight in a sentence or two, for its result card (how long, who fell, who stood), in
   * words with no numbers; absent from engines that don't tell one.
   */
  readonly summary?: string;
  /** How each summon the player called ended its part, by call id (the last call of each). */
  readonly summons?: Readonly<Record<string, SummonFate>>;
  /** Insects in the player's hive as the fight ended; absent without a hive. */
  readonly swarm?: number;
  /** Dust the player still commands as the fight ended; absent without any. */
  readonly dust?: number;
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
