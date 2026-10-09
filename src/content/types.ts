import type { StatDelta } from '@/systems/stats';

/**
 * Content schemas that are not owned by a single system. Schemas that *are* owned by a
 * system (TechniqueDef, MissionDef) live with that system and are imported from it.
 */

export interface TrainingDef {
  readonly id: string;
  readonly name: string;
  readonly location: string;
  readonly description: string;
  readonly slots: number;
  readonly energyCost: number;
  /** Base stat gains per session, before diminishing returns. */
  readonly gains: StatDelta;
}

export interface FoodDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cost: number;
  readonly satiety: number;
  readonly energy: number;
  readonly slots: number;
}

export interface EnemyDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
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

/** Anything with a stable id can live in a catalog. */
export interface Identified {
  readonly id: string;
}
