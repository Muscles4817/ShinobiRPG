import type { Find } from '@/systems/cooking';
import type { AtlasDef } from './atlas';
import type { ExamDef } from '@/systems/exams';
import type { ArcDef, EncounterTemplate, MissionDef, RoadEventDef } from '@/systems/missions';
import type { TechniqueDef } from '@/systems/techniques';
import type { RouteDef } from '@/systems/travel';

import { createCatalog, type Catalog } from './catalog';
import type { ExerciseDef } from './exercises';
import type { FieldBookRewards } from './fieldBook';
import type { FurnishingDef, GardenCrop, HomeDef } from './homes';
import type { QuirkDef } from './quirks';
import type { CurriculumBeat } from './curriculum';
import type { SenseiTestDef } from './senseiTests';
import type { InjuryDef } from './injuries';
import type { BuildDef, UpbringingDef } from './upbringing';
import type { VoiceDef } from './voices';
import type {
  BreakInScene,
  ClanDef,
  ContentPack,
  ConversationDef,
  ConversationTopic,
  GearDef,
  ToolDef,
  IngredientDef,
  RecipeDef,
  CookbookDef,
  EnemyDef,
  FoodDef,
  LocationDef,
  NamePools,
  NindoDef,
  PersonDef,
  SettingText,
  TalentDef,
  TeamText,
  TrainingDef,
  TraitDef,
  VillageLife,
} from './types';
import type { Discipline } from '@/systems/techniques';

/**
 * A content pack indexed for lookup. The game receives this through its context, so tests
 * can supply a tiny bespoke pack instead of a real one.
 */
export interface ContentDb {
  readonly packId: string;
  readonly packName: string;
  readonly startLocationId: string;
  readonly startingRyo: number;
  readonly text: SettingText;
  readonly locations: Catalog<LocationDef>;
  readonly routes: Catalog<RouteDef>;
  /** How the country looks on the Travel tab's map. */
  readonly atlas: AtlasDef;
  readonly exercises: Catalog<ExerciseDef>;
  readonly senseiTests: Catalog<SenseiTestDef>;
  readonly curriculum: Catalog<CurriculumBeat>;
  readonly techniques: Catalog<TechniqueDef>;
  readonly missions: Catalog<MissionDef>;
  readonly exams: Catalog<ExamDef>;
  readonly encounters: Catalog<EncounterTemplate>;
  readonly roadEvents: Catalog<RoadEventDef>;
  readonly arcs: Catalog<ArcDef>;
  readonly voices: readonly VoiceDef[];
  readonly enemies: Catalog<EnemyDef>;
  readonly training: Catalog<TrainingDef>;
  readonly foods: Catalog<FoodDef>;
  readonly clans: Catalog<ClanDef>;
  readonly builds: Catalog<BuildDef>;
  readonly upbringings: Catalog<UpbringingDef>;
  readonly talents: Catalog<TalentDef>;
  readonly quirks: Catalog<QuirkDef>;
  readonly homes: Catalog<HomeDef>;
  readonly furnishings: Catalog<FurnishingDef>;
  readonly gardenCrops: readonly GardenCrop[];
  readonly fieldBook: FieldBookRewards;
  readonly traits: Catalog<TraitDef>;
  readonly nindos: Catalog<NindoDef>;
  readonly breakIn: BreakInScene;
  readonly gear: Catalog<GearDef>;
  readonly tools: Catalog<ToolDef>;
  readonly injuries: Catalog<InjuryDef>;
  readonly ingredients: Catalog<IngredientDef>;
  readonly recipes: Catalog<RecipeDef>;
  readonly cookbooks: Catalog<CookbookDef>;
  readonly campFinds: readonly Find[];
  readonly people: Catalog<PersonDef>;
  readonly conversations: Catalog<ConversationDef>;
  readonly conversationTopics: readonly ConversationTopic[];
  readonly names: NamePools;
  readonly team: TeamText;
  readonly village: VillageLife;
  readonly academyTechniques: readonly string[];
  readonly disciplineStarters: Readonly<Record<Discipline, string>>;
}

export function buildContentDb(pack: ContentPack): ContentDb {
  return {
    packId: pack.id,
    packName: pack.name,
    startLocationId: pack.startLocationId,
    startingRyo: pack.startingRyo,
    text: pack.text,
    locations: createCatalog('location', pack.locations),
    routes: createCatalog('route', pack.routes),
    atlas: pack.atlas,
    exercises: createCatalog('exercise', pack.exercises),
    senseiTests: createCatalog('sensei test', pack.senseiTests),
    curriculum: createCatalog('curriculum beat', pack.curriculum),
    techniques: createCatalog('technique', pack.techniques),
    missions: createCatalog('mission', pack.missions),
    exams: createCatalog('exam', pack.exams),
    encounters: createCatalog('encounter', pack.encounters),
    roadEvents: createCatalog('road event', pack.roadEvents),
    arcs: createCatalog('arc', pack.arcs),
    voices: pack.voices,
    enemies: createCatalog('enemy', pack.enemies),
    training: createCatalog('training', pack.training),
    foods: createCatalog('food', pack.foods),
    clans: createCatalog('clan', pack.clans),
    builds: createCatalog('build', pack.builds),
    upbringings: createCatalog('upbringing', pack.upbringings),
    talents: createCatalog('talent', pack.talents),
    quirks: createCatalog('quirk', pack.quirks),
    homes: createCatalog('home', pack.homes),
    furnishings: createCatalog('furnishing', pack.furnishings),
    gardenCrops: pack.gardenCrops,
    fieldBook: pack.fieldBook,
    traits: createCatalog('trait', pack.traits),
    nindos: createCatalog('nindo', pack.nindos),
    breakIn: pack.breakIn,
    gear: createCatalog('gear', pack.gear),
    tools: createCatalog('tool', pack.tools),
    injuries: createCatalog('injury', pack.injuries),
    ingredients: createCatalog('ingredient', pack.ingredients),
    recipes: createCatalog('recipe', pack.recipes),
    cookbooks: createCatalog('cookbook', pack.cookbooks),
    campFinds: pack.campFinds,
    people: createCatalog('person', pack.people),
    conversations: createCatalog('conversation', pack.conversations),
    conversationTopics: pack.conversationTopics,
    names: pack.names,
    team: pack.team,
    village: pack.village,
    academyTechniques: pack.academyTechniques,
    disciplineStarters: pack.disciplineStarters,
  };
}
