import type { CombatState } from '@/systems/combat';
import type { Housing } from '@/systems/housing';
import type { Journal } from '@/systems/journal';
import type { MissionRun } from '@/systems/missions';
import type { Standing } from '@/systems/standing';
import type { Stats } from '@/systems/stats';
import type { TechniqueBook } from '@/systems/techniques';
import type { GameTime } from '@/systems/time';
import type { Vitals } from '@/systems/vitals';
import type { Wallet } from '@/systems/wallet';

import type { Report } from './reports';

/**
 * The complete, JSON-serialisable state of one playthrough.
 * Each field is a slice owned by one system; the game layer is the only place that
 * combines them. Adding a slice = add it here, to `createNewGame`, and a save migration
 * in `persistence.ts`.
 */
export interface GameState {
  /** The content pack this playthrough uses. Fixed for the life of the save. */
  readonly packId: string;
  readonly rngState: number;
  readonly time: GameTime;
  /** The location the character is in; its places are what the village screen shows. */
  readonly locationId: string;
  readonly character: Character;
  readonly wallet: Wallet;
  readonly housing: Housing;
  readonly techniques: TechniqueBook;
  readonly standing: Standing;
  readonly journal: Journal;
  /** The mission in progress, if any. */
  readonly mission: MissionRun | null;
  /** The fight in progress, if any. Opaque: only the combat engine reads it. */
  readonly combat: CombatState | null;
  /** Result cards waiting to be shown, oldest first. */
  readonly reports: readonly Report[];
}

export interface Character {
  readonly name: string;
  readonly aptitudeId: string;
  readonly stats: Stats;
  /** Stats on graduation day, to show growth. */
  readonly startingStats: Stats;
  readonly vitals: Vitals;
}
