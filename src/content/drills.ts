import type { StatDelta } from '@/systems/stats';
import type { Season } from '@/systems/time';

import type { IconId } from './art';

/** What a training place and an eatery offer: a drill, and a dish off the menu. */

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
  /**
   * The weapon a session works, besides the stats: the one in hand (forms) or the thrown one
   * (target practice; plain kunai with none), whose mastery grows (`game/weaponMastery.ts`).
   */
  readonly practises?: 'held' | 'thrown';
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
