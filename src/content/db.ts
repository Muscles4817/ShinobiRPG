import type { MissionDef } from '@/systems/missions';
import type { TechniqueDef } from '@/systems/techniques';

import { ACADEMY_TECHNIQUES, APTITUDES } from './aptitudes';
import { createCatalog, type Catalog } from './catalog';
import { ENEMIES } from './enemies';
import { FOODS } from './food';
import { MISSIONS } from './missions';
import { TECHNIQUES } from './techniques';
import { TRAINING } from './training';
import type { AptitudeDef, EnemyDef, FoodDef, TrainingDef } from './types';

/**
 * Everything data-driven the game needs. The game receives this through its context,
 * so tests can supply a tiny bespoke database instead of the real one.
 */
export interface ContentDb {
  readonly techniques: Catalog<TechniqueDef>;
  readonly missions: Catalog<MissionDef>;
  readonly enemies: Catalog<EnemyDef>;
  readonly training: Catalog<TrainingDef>;
  readonly foods: Catalog<FoodDef>;
  readonly aptitudes: Catalog<AptitudeDef>;
  readonly academyTechniques: readonly string[];
}

export interface ContentSource {
  readonly techniques: readonly TechniqueDef[];
  readonly missions: readonly MissionDef[];
  readonly enemies: readonly EnemyDef[];
  readonly training: readonly TrainingDef[];
  readonly foods: readonly FoodDef[];
  readonly aptitudes: readonly AptitudeDef[];
  readonly academyTechniques: readonly string[];
}

export function buildContentDb(source: ContentSource): ContentDb {
  return {
    techniques: createCatalog('technique', source.techniques),
    missions: createCatalog('mission', source.missions),
    enemies: createCatalog('enemy', source.enemies),
    training: createCatalog('training', source.training),
    foods: createCatalog('food', source.foods),
    aptitudes: createCatalog('aptitude', source.aptitudes),
    academyTechniques: source.academyTechniques,
  };
}

export const DEFAULT_CONTENT_SOURCE: ContentSource = {
  techniques: TECHNIQUES,
  missions: MISSIONS,
  enemies: ENEMIES,
  training: TRAINING,
  foods: FOODS,
  aptitudes: APTITUDES,
  academyTechniques: ACADEMY_TECHNIQUES,
};
