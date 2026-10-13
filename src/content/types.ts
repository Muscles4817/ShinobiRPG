import type { CombatTrait } from '@/systems/combat';
import type { EncounterTemplate, MissionDef } from '@/systems/missions';
import type { ModifierSpec } from '@/systems/modifiers';
import type { StatDelta, StatId } from '@/systems/stats';
import type { ExamDef } from '@/systems/exams';
import type { Discipline, Element, TechniqueDef } from '@/systems/techniques';
import type { Season } from '@/systems/time';

import type { BackdropId, IconId } from './art';
import type { GearDef, IngredientDef, RecipeDef, ToolDef } from './items';
import type { InjuryDef } from './injuries';
import type {
  ConversationDef,
  ConversationTopic,
  NamePools,
  PersonDef,
  TeamText,
  Tone,
} from './people';
import type { SettingText } from './settingText';
import type { OpeningHours, Stall } from './stall';
import type { VillageLife } from './village';

export type { BackdropId, IconId } from './art';
export type {
  GearDef,
  GearKind,
  GearSlot,
  IngredientCount,
  IngredientDef,
  RecipeDef,
  ToolDef,
} from './items';
export type {
  ConversationChoice,
  ConversationDef,
  ConversationTopic,
  NamePools,
  PersonDef,
  PersonRank,
  PersonRole,
  SenseiProfile,
  TeamText,
  Tone,
  TopicKind,
} from './people';
export type { OpeningHours, Stall } from './stall';
export type { AptitudeText, PromotedRank, PromotionText, SettingText } from './settingText';
export type {
  PriceTemplate,
  SimplePrice,
  Steering,
  SteeringFocus,
  TeacherProfile,
  TeachingQuirk,
} from './teachers';
export type { FestivalDef, RumourDef, SightDef, VillageLife } from './village';

/**
 * Content schemas. A ContentPack is one complete, self-contained setting (names, places,
 * techniques, missions…). Schemas owned by a system (TechniqueDef, MissionDef) live with
 * that system; the rest are defined here.
 */

export interface Identified {
  readonly id: string;
}

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
  /** Only on the menu in these seasons; absent means all year. */
  readonly seasons?: readonly Season[];
}

export interface EnemyDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Short tag shown on the enemy's banner in a fight, e.g. "Spirit", "Beast". */
  readonly kind: string;
  readonly baseStat: number;
  readonly statBonuses: StatDelta;
  /**
   * Health as a multiple of a human's 100: a giant beast more, a small creature less.
   * Humans leave it out (1).
   */
  readonly healthScale?: number;
  readonly maxChakra: number;
  readonly techniqueIds: readonly string[];
  /** Elemental nature, for matchups; most enemies have none. */
  readonly nature?: Element;
  /** How they fight: archer, brawler, illusionist… Every fight style honours these. */
  readonly traits?: readonly CombatTrait[];
}

/** A family the character can be born into. Clans shape growth and give techniques. */
export interface ClanDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly statBonuses: StatDelta;
  readonly modifiers: ModifierSpec;
  /**
   * The stats the clan is known for. Members' aptitude in them has a high floor and a narrow
   * spread; elsewhere they are ordinary. Empty for the clanless, whose talent is a wide gamble.
   */
  readonly arts: readonly StatId[];
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

interface PlaceBase {
  readonly id: string;
  readonly name: string;
  readonly icon: IconId;
  /** One line under the name on the village screen when nothing more specific applies. */
  readonly blurb: string;
  /** Shops and schools close; homes, grounds, the hall and the hospital never do. */
  readonly hours?: OpeningHours;
}

/**
 * A place inside a location. `kind` decides which page the UI shows and which actions
 * are possible there; the kind-specific fields say what is on offer.
 */
export type PlaceDef =
  | (PlaceBase & { readonly kind: 'training'; readonly trainingIds: readonly string[] })
  | (PlaceBase & { readonly kind: 'market'; readonly stalls: readonly Stall[] })
  | (PlaceBase & { readonly kind: 'missions'; readonly missionIds: readonly string[] })
  /** Scrolls a fresh genin can study: rank E and D only. */
  | (PlaceBase & { readonly kind: 'academy'; readonly techniqueIds: readonly string[] })
  /** The restricted stacks: C and some B, open to chūnin and above. */
  | (PlaceBase & { readonly kind: 'library'; readonly techniqueIds: readonly string[] })
  | (PlaceBase & { readonly kind: 'home'; readonly rentPerWeek: number; readonly lodging: string })
  | (PlaceBase & { readonly kind: 'hospital'; readonly treatmentCost: number })
  | (PlaceBase & {
      /** An izakaya: open evenings and nights, with a menu and whoever drops in. */
      readonly kind: 'tavern';
      readonly keeper: string;
      readonly foodIds: readonly string[];
      /** What buying everyone inside a round costs. */
      readonly roundCost: number;
    })
  | (PlaceBase & {
      readonly kind: 'gear';
      /** Who runs the shop, e.g. "Old Tetsuya, smith". */
      readonly keeper: string;
      readonly gearIds: readonly string[];
      /** Fight tools sold by the piece. */
      readonly toolIds?: readonly string[];
    });

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
  /** Promotion exams, held on their dates (the chūnin exam). */
  readonly exams: readonly ExamDef[];
  /** Kinds of encounter the missions' encounter stages are built on. */
  readonly encounters: readonly EncounterTemplate[];
  readonly enemies: readonly EnemyDef[];
  readonly training: readonly TrainingDef[];
  readonly foods: readonly FoodDef[];
  readonly clans: readonly ClanDef[];
  readonly talents: readonly TalentDef[];
  readonly traits: readonly TraitDef[];
  readonly nindos: readonly NindoDef[];
  readonly breakIn: BreakInScene;
  readonly gear: readonly GearDef[];
  readonly tools: readonly ToolDef[];
  readonly injuries: readonly InjuryDef[];
  readonly ingredients: readonly IngredientDef[];
  readonly recipes: readonly RecipeDef[];
  readonly people: readonly PersonDef[];
  readonly conversations: readonly ConversationDef[];
  /** What templated conversations (`about`) are filled with, per specialty, trait, clan, role. */
  readonly conversationTopics: readonly ConversationTopic[];
  readonly names: NamePools;
  readonly team: TeamText;
  readonly village: VillageLife;
  readonly academyTechniques: readonly string[];
  /** The technique a graduate starts with for their specialty discipline. */
  readonly disciplineStarters: Readonly<Record<Discipline, string>>;
}
