import type { CombatForm, CombatGrammar, CombatPerk, CombatTrait } from '@/systems/combat';
import type { FoodDef, TrainingDef } from './drills';
import type { ContractDef, FoeSummon } from './contracts';
import type { ClanDust, DustDef } from './dusts';
import type { ClanHive, StrainDef } from './strains';
import type { AtlasDef, MapLabelSide } from './atlas';
import type {
  ClanCompanion,
  CompanionKindDef,
  CompanionLoreDef,
  RetinueEntry,
  VetFields,
} from './companions';
import type { Find } from '@/systems/cooking';
import type {
  ArcDef,
  Danger,
  EncounterTemplate,
  MissionDef,
  RoadEventDef,
} from '@/systems/missions';
import type { ModifierSpec } from '@/systems/modifiers';
import type { StatDelta, StatId } from '@/systems/stats';
import type { NoteWeight } from '@/systems/profile';
import type { ExamDef } from '@/systems/exams';
import type { Discipline, Element, TechniqueDef } from '@/systems/techniques';
import type { RouteDef } from '@/systems/travel';

import type { BackdropId, IconId } from './art';
import type { QuirkDef } from './quirks';
import type { FieldBookRewards } from './fieldBook';
import type { FurnishingDef, GardenCrop, HomeDef, LettingsFields } from './homes';
import type { ExerciseDef } from './exercises';
import type { CurriculumBeat } from './curriculum';
import type { SenseiSpeech } from './senseiSpeech';
import type { TraitDef } from './traits';
export type { TraitDef } from './traits';
import type { SenseiParts } from './senseiParts';
import type { SenseiTestDef } from './senseiTests';
import type { CookbookDef, GearDef, IngredientDef, RecipeDef, ToolDef } from './items';
import type { InjuryDef } from './injuries';
import type { BuildDef, UpbringingDef } from './upbringing';
import type { ConversationDef, ConversationTopic, NamePools, PersonDef, TeamText } from './people';
export type {
  ClassRegard,
  MissionPosture,
  NominationHabit,
  OpeningTest,
  Punctuality,
  RitualKind,
  SenseiCadence,
  SenseiFeedback,
  SenseiGatekeeping,
  SenseiGrip,
  SenseiLens,
  SenseiPhilosophy,
  SenseiReward,
  SenseiRitual,
  SenseiStory,
  SenseiWays,
  SessionFormat,
} from './senseis';
import type { SettingText } from './settingText';
import type { CompoundFields, OutsiderStance, QuarterFields } from './compounds';
import type { OnsenFields, TavernFields } from './leisure';
import type { OpeningHours, Stall } from './stall';
import type { VillageLife } from './village';
import type { VoiceDef } from './voices';
import type { Biome, FishingSpot, WildsFields } from './biomes';

export type { BackdropId, IconId } from './art';
export type {
  CookbookDef,
  GearDef,
  GearKind,
  GearSlot,
  FamilyCount,
  FishFamily,
  IngredientCount,
  IngredientDef,
  RecipeDef,
  RecipeIngredient,
  RecipeLesson,
  ToolDef,
} from './items';
export type {
  ConversationChoice,
  ConversationDef,
  ConversationTopic,
  NamePools,
  PersonArsenal,
  PersonDef,
  PersonRank,
  PersonRole,
  Phrased,
  Phrasings,
  Register,
  SenseiProfile,
  TeamText,
  Tone,
  TopicKind,
} from './people';
export type { OpeningHours, Stall } from './stall';
export type { DiceTable, OnsenFields, Pastime, PastimeGame, TavernFields, Waters } from './leisure';
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

export type { FoodDef, TrainingDef } from './drills';

export interface Identified {
  readonly id: string;
}

/** How a fight's story speaks of a foe: a person's pronouns, or "it" for a creature. */
export type FoePronouns = Exclude<CombatGrammar, 'you'>;

export interface EnemyDef {
  readonly id: string;
  readonly name: string;
  /**
   * A foe with a name of their own (a rogue called Ren) is told by it; any other is "the
   * bandit thug" in a fight's story, from `noun` or the name in lower case.
   */
  readonly proper?: boolean;
  /** The common noun when the name in lower case won't do: "Reikon macaque". */
  readonly noun?: string;
  /** How the story speaks of them; creatures are "it", people he or she by their id. */
  readonly pronouns?: FoePronouns;
  readonly description: string;
  /** Short tag shown on the enemy's banner in a fight, e.g. "Spirit", "Beast". */
  readonly kind: string;
  /**
   * What the fight's story makes of them when "it" and the spirit trait don't say: a `swarm`
   * stings. Words only, like `blow`: what their plain strike is called when their form's word
   * (a beast's bite) is wrong, such as a boar's "tusk".
   */
  readonly form?: CombatForm;
  readonly blow?: string;
  /** Who may be sent against them (`Danger`); validated against their strength. */
  readonly danger: Danger;
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
  /** Ingredients a beaten foe leaves (a beast's meat), one of each, into your pack. */
  readonly drops?: readonly string[];
  /** Bodies that fight beside them (`docs/design/retinue-plan.md`): a hound at heel. */
  readonly retinue?: readonly RetinueEntry[];
  /** Summons they can call into the fight, from a contract of the pack. */
  readonly summons?: readonly FoeSummon[];
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
  /** The companion a child of the clan grows up with (`companions.ts`). */
  readonly companion?: ClanCompanion;
  /** The hive a child of the clan is born with (`strains.ts`). */
  readonly hive?: ClanHive;
  /** The dust a child of the clan is born commanding (`dusts.ts`). */
  readonly dust?: ClanDust;
  /** How the clan treats outsiders at its compound's gate (`compounds.ts`). */
  readonly outsiders?: OutsiderStance;
  readonly kekkeiGenkai?: {
    readonly name: string;
    readonly description: string;
    /** Dormant bloodlines awaken through later events. */
    readonly dormant: boolean;
    /**
     * What the awakened eyes bring to a fight beyond reading foes (`insight`): reading movement
     * before it happens (`foresight`), copying techniques watched (`mimicry`).
     */
    readonly perks?: readonly CombatPerk[];
  };
}

/** A special talent noted on the academy file. Each has an upside and a downside. */
export interface TalentDef {
  readonly id: string;
  readonly name: string;
  /** How much of the file's room it takes (`STANDING_INFO.notes`); a flaw makes room. */
  readonly weight: NoteWeight;
  readonly description: string;
  readonly statBonuses: StatDelta;
  readonly modifiers: ModifierSpec;
  /** Fixes the hidden talent in these stats, whatever the roll; 0 means it will never take. */
  readonly aptitude?: Readonly<Partial<Record<StatId, number>>>;
  /** A note that contradicts this one: never on the same file. */
  readonly opposite?: string;
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

export type { Biome, FishingSpot, WildsFields };

interface PlaceBase {
  readonly id: string;
  readonly name: string;
  readonly icon: IconId;
  /** One line under the name on the village screen when nothing more specific applies. */
  readonly blurb: string;
  /**
   * The name as it reads mid-sentence, when the title doesn't ("the training ground" for
   * "Training Grounds"); starts lower case (validated). Read through `placeInSentence`.
   */
  readonly inText?: string;
  /** Shops and schools close; homes, grounds, the hall and the hospital never do. */
  readonly hours?: OpeningHours;
}

/**
 * A place inside a location. `kind` decides which page the UI shows and which actions
 * are possible there; the kind-specific fields say what is on offer.
 */
export type PlaceDef =
  | (PlaceBase & {
      readonly kind: 'training';
      readonly trainingIds: readonly string[];
      /** Chakra control exercises practised here (`ExerciseDef`). */
      readonly exerciseIds?: readonly string[];
    })
  | (PlaceBase & { readonly kind: 'market'; readonly stalls: readonly Stall[] })
  | (PlaceBase & { readonly kind: 'missions'; readonly missionIds: readonly string[] })
  /** Scrolls a fresh genin can study: rank E and D only. */
  | (PlaceBase & { readonly kind: 'academy'; readonly techniqueIds: readonly string[] })
  /** The restricted stacks: C and some B, open to chūnin and above. */
  | (PlaceBase & { readonly kind: 'library'; readonly techniqueIds: readonly string[] })
  | (PlaceBase & { readonly kind: 'home'; readonly rentPerWeek: number; readonly lodging: string })
  | (PlaceBase & { readonly kind: 'hospital'; readonly treatmentCost: number })
  /** Somewhere to sleep away from home: a room by the night. */
  | (PlaceBase & { readonly kind: 'inn'; readonly keeper: string; readonly roomCost: number })
  | (PlaceBase & LettingsFields)
  /** A house for sale in a town: bought once, then yours to sleep in, with no rent. */
  | (PlaceBase & { readonly kind: 'house'; readonly seller: string; readonly price: number })
  | (PlaceBase & WildsFields)
  | (PlaceBase & TavernFields)
  | (PlaceBase & CompoundFields)
  | (PlaceBase & QuarterFields)
  | (PlaceBase & VetFields)
  | (PlaceBase & OnsenFields)
  | (PlaceBase & {
      readonly kind: 'gear';
      /** Who runs the shop, e.g. "Old Tetsuya, smith". */
      readonly keeper: string;
      readonly gearIds: readonly string[];
      /** Fight tools sold by the piece. */
      readonly toolIds?: readonly string[];
      /** Handling lore for companions (`CompanionLoreDef`). */
      readonly loreIds?: readonly string[];
    });

export type PlaceKind = PlaceDef['kind'];

export interface LocationDef {
  readonly id: string;
  readonly name: string;
  /** e.g. "Village Hidden in the Leaves". */
  readonly epithet: string;
  readonly backdrop: BackdropId;
  /**
   * Where it sits on the pack's map (`MAP_SIZE`): x from the west edge, y from the north, and
   * which side of its seal the name goes (below unless said).
   */
  readonly map: { readonly x: number; readonly y: number; readonly label?: MapLabelSide };
  /** Empty for places you can't visit yet. */
  readonly places: readonly PlaceDef[];
  /** Why it can't be visited yet; absent when travel is possible. The way there is a route. */
  readonly lockedReason?: string;
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
  /** The roads between locations. */
  readonly routes: readonly RouteDef[];
  /** How the country looks on the Travel tab's map. */
  readonly atlas: AtlasDef;
  /** Chakra control exercises (tree-walking, water-walking). */
  readonly exercises: readonly ExerciseDef[];
  /** The tests senseis set new teams, by kind (`SenseiWays.test`). */
  readonly senseiTests: readonly SenseiTestDef[];
  /** What a sensei shows a new genin, one thing at a time (the tutorial). */
  readonly curriculum: readonly CurriculumBeat[];
  /** How a sensei's week sounds: sessions, sign-offs, the morning's notes. */
  readonly senseiSpeech: SenseiSpeech;
  /** What generated senseis are made from (`senseiParts.ts`). */
  readonly senseiParts: SenseiParts;
  readonly techniques: readonly TechniqueDef[];
  readonly missions: readonly MissionDef[];
  /** Promotion exams, held on their dates (the chūnin exam). */
  readonly exams: readonly ExamDef[];
  /** Kinds of encounter the missions' encounter stages are built on. */
  readonly encounters: readonly EncounterTemplate[];
  /** Things that may happen on a stretch of road, by region. */
  readonly roadEvents: readonly RoadEventDef[];
  /** Long stories: chains of jobs in acts. */
  readonly arcs: readonly ArcDef[];
  /** What crew say on a job, by moment and trait. */
  readonly voices: readonly VoiceDef[];
  readonly enemies: readonly EnemyDef[];
  /** Kinds of creature that may become someone's companion. */
  readonly companionKinds: readonly CompanionKindDef[];
  readonly companionLore: readonly CompanionLoreDef[];
  readonly contracts: readonly ContractDef[];
  readonly strains: readonly StrainDef[];
  /** Kinds of dust a user may command (`dusts.ts`), shared by every pack. */
  readonly dusts: readonly DustDef[];
  readonly training: readonly TrainingDef[];
  readonly foods: readonly FoodDef[];
  readonly clans: readonly ClanDef[];
  readonly builds: readonly BuildDef[];
  readonly upbringings: readonly UpbringingDef[];
  readonly talents: readonly TalentDef[];
  readonly homes: readonly HomeDef[];
  readonly furnishings: readonly FurnishingDef[];
  readonly gardenCrops: readonly GardenCrop[];
  readonly fieldBook: FieldBookRewards;
  readonly quirks: readonly QuirkDef[];
  readonly traits: readonly TraitDef[];
  readonly nindos: readonly NindoDef[];
  readonly breakIn: BreakInScene;
  readonly gear: readonly GearDef[];
  readonly tools: readonly ToolDef[];
  readonly injuries: readonly InjuryDef[];
  readonly ingredients: readonly IngredientDef[];
  readonly recipes: readonly RecipeDef[];
  readonly cookbooks: readonly CookbookDef[];
  /** What can be foraged around a camp on the road. */
  readonly campFinds: readonly Find[];
  readonly people: readonly PersonDef[];
  /**
   * Authored people who fight in versus mode but don't live in the world yet: no schedule, no
   * teaching, no part in any job. Plumbing one in moves them to `people`, where every rule for
   * the cast applies (their techniques then need a real source).
   */
  readonly duelists?: readonly PersonDef[];
  readonly conversations: readonly ConversationDef[];
  /** What templated conversations (`about`) are filled with, per specialty, trait, clan, role. */
  readonly conversationTopics: readonly ConversationTopic[];
  readonly names: NamePools;
  readonly team: TeamText;
  readonly village: VillageLife;
  readonly academyTechniques: readonly string[];
  /** The technique a graduate starts with for their specialty discipline. */
  readonly disciplineStarters: Readonly<Record<Discipline, string>>;
  /**
   * Techniques merged into another (old id → the id it became), so saves that knew the old one
   * are moved over (`techniqueRenameMigration.ts`). Old ids are gone, new ones real (validated).
   */
  readonly renamedTechniques?: Readonly<Record<string, string>>;
}
