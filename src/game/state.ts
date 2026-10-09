import type { CombatState } from '@/systems/combat';
import type { Housing } from '@/systems/housing';
import type { Inventory } from '@/systems/inventory';
import type { Journal } from '@/systems/journal';
import type { Appearance, Grades, Pronouns } from '@/systems/profile';
import type { MissionRun } from '@/systems/missions';
import type { Standing } from '@/systems/standing';
import type { Stats } from '@/systems/stats';
import type { Element, TechniqueBook } from '@/systems/techniques';
import type { GameTime } from '@/systems/time';
import type { Vitals } from '@/systems/vitals';
import type { Wallet } from '@/systems/wallet';

import type { Board } from './boardState';
import type { People } from './people/state';
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
  /** Classmates, bonds, your team and any conversation in progress. */
  readonly people: People;
  /** Player preferences that belong to this save, e.g. the fight style. */
  readonly settings: Settings;
  /** The jobs board: what is posted and when standing jobs were last taken. */
  readonly board: Board;
  /** Gear you own and wear, and your pantry. */
  readonly inventory: Inventory;
}

/** Player preferences stored with the save. */
export interface Settings {
  /** Engine id of the fight style used for new fights. */
  readonly combatStyle: string;
}

export interface Character {
  readonly name: string;
  /** Family name; for clan members, the clan's name. */
  readonly familyName: string;
  readonly pronouns: Pronouns;
  readonly appearance: Appearance;
  readonly clanId: string;
  readonly grades: Grades;
  readonly nature: Element;
  readonly traitIds: readonly string[];
  /** Null for characters from saves made before talents existed. */
  readonly talentId: string | null;
  readonly nindoId: string | null;
  /** How the academy break-in went; later scenes remember it. */
  readonly breakIn: { readonly approachId: string; readonly succeeded: boolean };
  readonly stats: Stats;
  /** Stats on graduation day, to show growth. */
  readonly startingStats: Stats;
  readonly vitals: Vitals;
  /** Today's home-cooked meal (a recipe id): its buff lasts until the day ends. */
  readonly meal: string | null;
}
