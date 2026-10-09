import type { CombatState } from '@/systems/combat';
import type { Journal } from '@/systems/journal';
import type { MissionRun } from '@/systems/missions';
import type { Standing } from '@/systems/standing';
import type { Stats } from '@/systems/stats';
import type { TechniqueBook } from '@/systems/techniques';
import type { GameTime } from '@/systems/time';
import type { Vitals } from '@/systems/vitals';
import type { Wallet } from '@/systems/wallet';

/**
 * The complete, JSON-serialisable state of one playthrough.
 * Each field is a slice owned by one system; the game layer is the only place that
 * combines them. Adding a system = add its slice here, to `createNewGame`, and (if the
 * save shape changes) a migration in `persistence.ts`.
 */
export interface GameState {
  readonly rngState: number;
  readonly time: GameTime;
  readonly character: Character;
  readonly wallet: Wallet;
  readonly techniques: TechniqueBook;
  readonly standing: Standing;
  readonly journal: Journal;
  /** The mission in progress, if any. */
  readonly mission: MissionRun | null;
  /** The fight in progress, if any. Opaque: only the combat engine reads it. */
  readonly combat: CombatState | null;
}

export interface Character {
  readonly name: string;
  readonly aptitudeId: string;
  readonly stats: Stats;
  readonly vitals: Vitals;
}
