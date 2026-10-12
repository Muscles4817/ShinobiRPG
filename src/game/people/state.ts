import type { PersonDef } from '@/content';
import type { Bond } from '@/systems/bonds';
import type { Stats } from '@/systems/stats';

/**
 * The people slice of GameState: generated classmates, your bonds with everyone, your team,
 * the conversation in progress and how far genin have grown. Authored people live in content;
 * generated ones are stored here in the same shape, so the rest of the game treats them alike.
 */
export interface People {
  readonly generated: readonly PersonDef[];
  /** How far genin have grown since they were made, keyed by person id. */
  readonly progress: Readonly<Record<string, PersonProgress>>;
  /** Keyed by person id. Missing means you have never spoken. */
  readonly bonds: Readonly<Record<string, Bond>>;
  /** Null until teams are read out the morning after graduation. */
  readonly team: Team | null;
  readonly conversation: Conversation | null;
  /** The genin you are sparring with while a spar's fight is on. */
  readonly sparringWith: string | null;
}

/** A genin's stats now, and the last day whose training is in them. */
export interface PersonProgress {
  readonly stats: Stats;
  readonly lastGrownDay: number;
}

export interface Team {
  readonly teammateIds: readonly string[];
  /** The two jōnin who asked for your team. */
  readonly senseiOptions: readonly string[];
  /** Null until you choose. */
  readonly senseiId: string | null;
  /** The day of your last lesson with your sensei, if any. */
  readonly lastLessonDay: number | null;
}

export interface Conversation {
  readonly personId: string;
  readonly conversationId: string;
  /** Set once you have replied. */
  readonly answer: Answer | null;
}

export interface Answer {
  readonly choiceIndex: number;
  readonly delta: number;
  /** The stage reached, if this reply moved you up one. */
  readonly newStage: number | null;
}

export const NO_PEOPLE: People = {
  generated: [],
  progress: {},
  bonds: {},
  team: null,
  conversation: null,
  sparringWith: null,
};
