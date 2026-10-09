import type { MissionDef } from '@/systems/missions';
import type { TechniqueDef } from '@/systems/techniques';

import { createCatalog, type Catalog } from './catalog';
import type {
  AptitudeDef,
  ContentPack,
  EnemyDef,
  FoodDef,
  LocationDef,
  SettingText,
  TrainingDef,
} from './types';

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
  readonly aptitudes: Catalog<AptitudeDef>;
  readonly academyTechniques: readonly string[];
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
    aptitudes: createCatalog('aptitude', pack.aptitudes),
    academyTechniques: pack.academyTechniques,
  };
}
