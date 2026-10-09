import type { MissionDef } from '@/systems/missions';
import type { TechniqueDef } from '@/systems/techniques';

import { createCatalog, type Catalog } from './catalog';
import type {
  BreakInScene,
  ClanDef,
  ContentPack,
  ConversationDef,
  GearDef,
  IngredientDef,
  RecipeDef,
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
  readonly techniques: Catalog<TechniqueDef>;
  readonly missions: Catalog<MissionDef>;
  readonly enemies: Catalog<EnemyDef>;
  readonly training: Catalog<TrainingDef>;
  readonly foods: Catalog<FoodDef>;
  readonly clans: Catalog<ClanDef>;
  readonly talents: Catalog<TalentDef>;
  readonly traits: Catalog<TraitDef>;
  readonly nindos: Catalog<NindoDef>;
  readonly breakIn: BreakInScene;
  readonly gear: Catalog<GearDef>;
  readonly ingredients: Catalog<IngredientDef>;
  readonly recipes: Catalog<RecipeDef>;
  readonly people: Catalog<PersonDef>;
  readonly conversations: Catalog<ConversationDef>;
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
    techniques: createCatalog('technique', pack.techniques),
    missions: createCatalog('mission', pack.missions),
    enemies: createCatalog('enemy', pack.enemies),
    training: createCatalog('training', pack.training),
    foods: createCatalog('food', pack.foods),
    clans: createCatalog('clan', pack.clans),
    talents: createCatalog('talent', pack.talents),
    traits: createCatalog('trait', pack.traits),
    nindos: createCatalog('nindo', pack.nindos),
    breakIn: pack.breakIn,
    gear: createCatalog('gear', pack.gear),
    ingredients: createCatalog('ingredient', pack.ingredients),
    recipes: createCatalog('recipe', pack.recipes),
    people: createCatalog('person', pack.people),
    conversations: createCatalog('conversation', pack.conversations),
    names: pack.names,
    team: pack.team,
    village: pack.village,
    academyTechniques: pack.academyTechniques,
    disciplineStarters: pack.disciplineStarters,
  };
}
