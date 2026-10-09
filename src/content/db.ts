import type { MissionDef } from '@/systems/missions';
import type { TechniqueDef } from '@/systems/techniques';

import { createCatalog, type Catalog } from './catalog';
import type {
  BreakInScene,
  ClanDef,
  ContentPack,
  EnemyDef,
  FoodDef,
  LocationDef,
  NindoDef,
  SettingText,
  TalentDef,
  TrainingDef,
  TraitDef,
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
    academyTechniques: pack.academyTechniques,
    disciplineStarters: pack.disciplineStarters,
  };
}
