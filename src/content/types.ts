import type { MissionDef } from '@/systems/missions';
import type { StatDelta } from '@/systems/stats';
import type { TechniqueDef } from '@/systems/techniques';

/**
 * Content schemas. A ContentPack is one complete, self-contained setting (names, places,
 * techniques, missions…). Schemas owned by a system (TechniqueDef, MissionDef) live with
 * that system; the rest are defined here.
 */

export interface Identified {
  readonly id: string;
}

/** Drawn scenery the UI knows how to paint. Adding one = add it here and in ui/art. */
export type BackdropId =
  'leaf-village' | 'lantern-rooftops' | 'dunes' | 'coast' | 'mist' | 'mountain';

/** Small line drawings for places, items and drills. */
export type IconId =
  | 'post'
  | 'bowl'
  | 'board'
  | 'scroll'
  | 'house'
  | 'heal'
  | 'torii'
  | 'lantern'
  | 'fish'
  | 'rice'
  | 'pill'
  | 'tea'
  | 'wind'
  | 'cart'
  | 'fist'
  | 'wave'
  | 'eye'
  | 'leaf'
  | 'tree'
  | 'dango'
  | 'grill';

export interface TrainingDef {
  readonly id: string;
  readonly name: string;
  /** Spot within the training place, e.g. "Training Ground 3". */
  readonly spot: string;
  /** One line of flavour shown in the record. No numbers. */
  readonly description: string;
  readonly icon: IconId;
  readonly slots: number;
  readonly energyCost: number;
  /** Base stat gains per session, before diminishing returns. */
  readonly gains: StatDelta;
}

export interface FoodDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: IconId;
  readonly cost: number;
  readonly satiety: number;
  readonly energy: number;
  readonly slots: number;
}

export interface EnemyDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Short tag shown on the enemy's banner in a fight, e.g. "Spirit", "Beast". */
  readonly kind: string;
  readonly baseStat: number;
  readonly statBonuses: StatDelta;
  readonly maxHealth: number;
  readonly maxChakra: number;
  readonly techniqueIds: readonly string[];
}

/** The specialty chosen at character creation. */
export interface AptitudeDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly statBonuses: StatDelta;
  readonly techniqueIds: readonly string[];
}

export interface Stall {
  readonly name: string;
  readonly blurb: string;
  readonly icon: IconId;
  readonly foodIds: readonly string[];
}

interface PlaceBase {
  readonly id: string;
  readonly name: string;
  readonly icon: IconId;
  /** One line under the name on the village screen when nothing more specific applies. */
  readonly blurb: string;
}

/**
 * A place inside a location. `kind` decides which page the UI shows and which actions
 * are possible there; the kind-specific fields say what is on offer.
 */
export type PlaceDef =
  | (PlaceBase & { readonly kind: 'training'; readonly trainingIds: readonly string[] })
  | (PlaceBase & { readonly kind: 'market'; readonly stalls: readonly Stall[] })
  | (PlaceBase & { readonly kind: 'missions'; readonly missionIds: readonly string[] })
  | (PlaceBase & { readonly kind: 'academy'; readonly techniqueIds: readonly string[] })
  | (PlaceBase & { readonly kind: 'home'; readonly rentPerWeek: number; readonly lodging: string })
  | (PlaceBase & { readonly kind: 'hospital'; readonly treatmentCost: number });

export type PlaceKind = PlaceDef['kind'];

export interface LocationDef {
  readonly id: string;
  readonly name: string;
  /** e.g. "Village Hidden in the Leaves". */
  readonly epithet: string;
  readonly backdrop: BackdropId;
  /** Empty for places you can't visit yet. */
  readonly places: readonly PlaceDef[];
  readonly travel: {
    readonly days: number;
    readonly cost: number;
    readonly danger: string;
    /** Why it can't be visited yet; absent when travel is possible. */
    readonly lockedReason?: string;
  };
}

/** Setting-specific wording the engine and UI need. Keeps names out of code. */
export interface SettingText {
  readonly nation: string;
  readonly leaderTitle: string;
  readonly currency: string;
  /** Intro shown on the new-game screen and as the first record entry. */
  readonly intro: string;
  /** Button on the new-game screen. */
  readonly graduate: string;
  readonly sleepWell: string;
  readonly sleepHungry: string;
  readonly sleepLockedOut: string;
  readonly hospitalWake: string;
}

export interface ContentPack {
  readonly id: string;
  /** Shown when choosing a world. */
  readonly name: string;
  readonly description: string;
  readonly startLocationId: string;
  readonly startingRyo: number;
  readonly text: SettingText;
  readonly locations: readonly LocationDef[];
  readonly techniques: readonly TechniqueDef[];
  readonly missions: readonly MissionDef[];
  readonly enemies: readonly EnemyDef[];
  readonly training: readonly TrainingDef[];
  readonly foods: readonly FoodDef[];
  readonly aptitudes: readonly AptitudeDef[];
  readonly academyTechniques: readonly string[];
}
