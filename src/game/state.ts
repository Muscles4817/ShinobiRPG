import type { CombatState } from '@/systems/combat';
import type { Cooking, MealQuality } from '@/systems/cooking';
import type { Housing } from '@/systems/housing';
import type { Exhaustion, Injury } from '@/systems/injuries';
import type { Inventory } from '@/systems/inventory';
import type { Journal } from '@/systems/journal';
import type { Appearance, ClassStanding, Grades, Pronouns } from '@/systems/profile';
import type { MissionRun } from '@/systems/missions';
import type { Standing } from '@/systems/standing';
import type { Aptitude, AptitudeKnown, StatDelta, StatId, Stats } from '@/systems/stats';
import type { Element, TechniqueBook } from '@/systems/techniques';
import type { GameTime } from '@/systems/time';
import type { Leave } from '@/systems/travel';
import type { Vitals } from '@/systems/vitals';
import type { Wallet } from '@/systems/wallet';

import type { Board } from './boardState';
import type { CombatFinale } from './combatFinale';
import type { Exams } from './exam/state';
import type { People } from './people/state';
import type { Assignment, Mentor } from './sensei/state';
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
  /** A fight that just ended, kept for the watch screen until you move on. */
  readonly combatFinale: CombatFinale | null;
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
  /** Village life you have taken part in. */
  readonly village: VillageMemory;
  /** The exam you are sitting, and a promotion waiting to be held. */
  readonly exams: Exams;
  /** Leave from the village for trips of your own: a genin's pass, a chūnin's days. */
  readonly leave: Leave;
  /** The recipes you know, how often you've cooked each, and your cooking grade. */
  readonly cooking: Cooking;
  /** How your sensei rates you and how this week's meetings went (`game/sensei/`). */
  readonly mentor: Mentor;
  /**
   * Set only on a versus sandbox (`game/versus/`): who is fighting whom. A sandbox is never
   * saved, so a real playthrough never carries it.
   */
  readonly versus?: VersusMatch;
}

/** A versus bout: the two sides' names and how your fighter came into it. */
export interface VersusMatch {
  readonly youId: string;
  readonly foeId: string;
  readonly foeName: string;
  readonly startHealth: number;
  readonly startChakra: number;
  readonly maxHealth: number;
}

/**
 * What the village remembers of you: the last night you followed a spirit or stood a round,
 * what your jobs left behind (world marks, which follow-up jobs and gossip read), moments the
 * people you went with remember, and the clients you have worked for.
 */
export interface VillageMemory {
  readonly lastSightDay: number | null;
  readonly lastRoundDay: number | null;
  readonly marks: readonly string[];
  readonly memories: readonly SharedMemory[];
  /** Jobs done for each client, by the client's name. */
  readonly clients: Readonly<Record<string, number>>;
}

/** A moment someone remembers from a job with you. */
export interface SharedMemory {
  readonly personId: string;
  /** As a phrase: "the night below the pass". */
  readonly text: string;
  readonly day: number;
}

/** Player preferences stored with the save. */
export interface Settings {
  /** Engine id of the fight style used for new fights. */
  readonly combatStyle: string;
  /**
   * What you last set up in each fight style (e.g. Plan & Watch cards), by engine id, so the
   * next fight starts from it. Opaque: only that engine reads it.
   */
  readonly combatPlans: Readonly<Record<string, unknown>>;
  /**
   * Small animations for everyday actions (eating, training, sleeping…) and the screen's other
   * motion. Off keeps the screen still; the device's reduced-motion setting always wins.
   */
  readonly animations: boolean;
}

/** An event that moved natural limits: where it came from, and how far each limit moved. */
export interface Breakthrough {
  /** What it was, unique per character (e.g. "promotion:chunin"). */
  readonly source: string;
  readonly limits: StatDelta;
}

/** A snack you ate: its buff works through slot `untilSlot` (counted from the first morning). */
export interface Snack {
  readonly recipeId: string;
  readonly quality: MealQuality;
  readonly untilSlot: number;
}

export interface Character {
  readonly name: string;
  /** Family name; for clan members, the clan's name. */
  readonly familyName: string;
  readonly pronouns: Pronouns;
  readonly appearance: Appearance;
  readonly clanId: string;
  /** The report card: a reading of the arts they graduated with. */
  readonly grades: Grades;
  /** Where they stood in their academy class: their early training budget and talent band. */
  readonly classStanding: ClassStanding;
  /** How they were raised (`UpbringingDef`). */
  readonly upbringingId: string;
  /** Their frame (`BuildDef`): how far strength and speed can go, and what bulk costs. */
  readonly buildId: string;
  /** Events that moved their natural limits (`breakthroughs.ts`), in the order they came. */
  readonly breakthroughs: readonly Breakthrough[];
  /** Their chakra nature, born with them (`nature.ts`)… */
  readonly nature: Element;
  /** …and whether the chakra paper has told them yet. */
  readonly natureKnown: boolean;
  readonly traitIds: readonly string[];
  /** Null for characters from saves made before talents existed. */
  readonly talentId: string | null;
  readonly nindoId: string | null;
  /** How the academy break-in went; later scenes remember it. */
  readonly breakIn: { readonly approachId: string; readonly succeeded: boolean };
  readonly stats: Stats;
  /** Stats on graduation day, to show growth. */
  readonly startingStats: Stats;
  /** Hidden talent per stat: a growth multiplier, 0 for an art that will never take. */
  readonly aptitude: Aptitude;
  /** What the character has found out about their aptitude, per stat. */
  readonly aptitudeKnown: AptitudeKnown;
  /** Sessions counted towards a first read of each stat's aptitude (missing = none). */
  readonly aptitudeSessions: Readonly<Partial<Record<StatId, number>>>;
  readonly vitals: Vitals;
  /** Today's home-cooked meal (a recipe id): its buff lasts until the day ends. */
  readonly meal: string | null;
  /** The work your sensei set at the last lesson, while it is open (`game/sensei/`). */
  readonly assignment: Assignment | null;
  /** How well today's meal turned out; absent means good (saves from before the stove). */
  readonly mealQuality?: MealQuality;
  /** A snack's short buff, alongside the meal; absent when none is working. */
  readonly snack?: Snack;
  /** Injuries you carry; each heals on its own morning. */
  readonly injuries: readonly Injury[];
  /**
   * Progress on chakra control exercises, out of 100, by exercise id (`game/exercises.ts`).
   * Absent: none begun (saves from before exercises). A mastered one is also a breakthrough.
   */
  readonly exercises?: Readonly<Record<string, number>>;
  /** Chakra exhaustion: nights' sleep refill only part of your chakra until it passes. */
  readonly exhaustion: Exhaustion | null;
}
