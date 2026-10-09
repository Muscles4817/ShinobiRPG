import type { MissionDef } from '@/systems/missions';
import type { ModifierSpec } from '@/systems/modifiers';
import type { StatDelta } from '@/systems/stats';
import type { Discipline, Element, TechniqueDef } from '@/systems/techniques';

import type { ConversationDef, NamePools, PersonDef, TeamText, Tone } from './people';

export type {
  ConversationChoice,
  ConversationDef,
  NamePools,
  PersonDef,
  PersonRole,
  SenseiProfile,
  TeamText,
  Tone,
} from './people';

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
  | 'grill'
  | 'sword'
  | 'seal';

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
  /** Elemental nature, for matchups; most enemies have none. */
  readonly nature?: Element;
}

/** A family the character can be born into. Clans shape growth and give techniques. */
export interface ClanDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly statBonuses: StatDelta;
  readonly modifiers: ModifierSpec;
  /** The clan's chakra nature; choosing the same nature earns a bonus. */
  readonly nature?: Element;
  readonly startingTechniqueIds: readonly string[];
  /** Clan members live rent-free here instead of renting. */
  readonly lodging?: string;
  readonly kekkeiGenkai?: {
    readonly name: string;
    readonly description: string;
    /** Dormant bloodlines awaken through later events. */
    readonly dormant: boolean;
  };
}

/** A special talent noted on the academy file. Each has an upside and a downside. */
export interface TalentDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly statBonuses: StatDelta;
  readonly modifiers: ModifierSpec;
}

/** A personality trait. Opposites can't be taken together. */
export interface TraitDef {
  readonly id: string;
  readonly name: string;
  /** How an instructor would write it in your file. */
  readonly note: string;
  readonly opposite?: string;
  readonly modifiers: ModifierSpec;
  /** How people with this trait react to the tone of what you say. */
  readonly likes: readonly Tone[];
  readonly dislikes: readonly Tone[];
}

/** Your dream: the goal you wrote in your academy application. */
export interface NindoDef {
  readonly id: string;
  readonly name: string;
  readonly essay: string;
}

export interface BreakInApproach {
  readonly id: string;
  readonly label: string;
  readonly stat: 'speed' | 'intellect' | 'genjutsu';
  readonly difficulty: number;
  readonly success: string;
  readonly failure: string;
}

/** The opening scene: breaking into the academy to read your own file. */
export interface BreakInScene {
  readonly intro: string;
  readonly approaches: readonly BreakInApproach[];
  readonly records: string;
  /** The instructor who catches you at the end. */
  readonly instructor: string;
  readonly caught: string;
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
  readonly clans: readonly ClanDef[];
  readonly talents: readonly TalentDef[];
  readonly traits: readonly TraitDef[];
  readonly nindos: readonly NindoDef[];
  readonly breakIn: BreakInScene;
  readonly people: readonly PersonDef[];
  readonly conversations: readonly ConversationDef[];
  readonly names: NamePools;
  readonly team: TeamText;
  readonly academyTechniques: readonly string[];
  /** The technique a graduate starts with for their specialty discipline. */
  readonly disciplineStarters: Readonly<Record<Discipline, string>>;
}
