import type { MissionRole } from './missionRank';
import type { Condition, Effect } from './story';
import type { StatId } from '@/systems/stats';

/**
 * The stages that make a mission a story rather than a list of checks: decisions with no roll,
 * a camp around the fire, and an ending chosen by what happened. Their shapes live here; how
 * they play is the game layer's.
 */

/** What a result does, and how the debrief tells it. */
export interface Outcome {
  readonly effects?: readonly Effect[];
  /** The debrief's line for it ("Lost the light at the spring"). No numbers. */
  readonly ledger?: string;
  /** Something found worth remembering (a clue): the debrief stamps its line. */
  readonly noted?: true;
}

/** A text that reads differently once something has happened. */
export interface TextVariant {
  readonly when: Condition;
  readonly text: string;
}

/** One way through a decision. */
export interface DecisionOption extends Outcome {
  readonly label: string;
  /**
   * How it comes across, as a conversation tone: the crew and the charge take it by their
   * tastes (validated against the pack's tones).
   */
  readonly tone?: string;
  /** Only offered when this holds. */
  readonly when?: Condition;
  /**
   * When it doesn't hold, the option still shows, closed, with this in-world reason ("You never
   * learned who she was"), so a choice never shrinks to one button without saying why.
   */
  readonly unseen?: string;
  /** What happens, in the story. */
  readonly reply: string;
}

export interface DecisionStage {
  readonly kind: 'decision';
  readonly text: string;
  readonly variants?: readonly TextVariant[];
  readonly options: readonly DecisionOption[];
}

/** Something to do by the fire. */
export type CampActivity =
  | {
      /** Sit with the charge; they open up once the condition holds. */
      readonly kind: 'charge';
      readonly label: string;
      readonly when?: Condition;
      readonly text: string;
      /** What they say when they won't open up yet. */
      readonly guarded: string;
      readonly opensWhen?: Condition;
      readonly outcome?: Outcome;
    }
  | {
      /** Keep watch: a check (a crew member with the role may take it). */
      readonly kind: 'watch';
      readonly label: string;
      readonly when?: Condition;
      readonly stat: StatId;
      readonly difficulty: number;
      readonly role?: MissionRole;
      readonly success: string;
      readonly failure: string;
      readonly onSuccess?: Outcome;
    }
  /**
   * Sit with someone in the crew, drill by the fire, sleep properly, forage near the camp, or
   * cook for everyone from what you carry.
   */
  | {
      readonly kind: 'crew' | 'drill' | 'rest' | 'forage' | 'cook';
      readonly label: string;
      readonly when?: Condition;
    };

export interface CampStage {
  readonly kind: 'camp';
  readonly text: string;
  readonly variants?: readonly TextVariant[];
  /** How many things there's time for before the fire burns down. */
  readonly picks: number;
  readonly activities: readonly CampActivity[];
}

/**
 * A trip's pause at a place on the way (`docs/design/journeys-plan.md` 3.3): the game decides
 * what the place offers by its kind (a room at a town's inn, a landmark's sight, a day in wild
 * country), and you take it or walk on.
 */
export interface StopStage {
  readonly kind: 'stop';
  readonly locationId: string;
}

export interface Ending extends Outcome {
  readonly when?: Condition;
  readonly text: string;
}

/** How the job ends: the first ending whose condition holds (the last has none: validated). */
export interface EndingStage {
  readonly kind: 'ending';
  readonly endings: readonly Ending[];
}

/** Something that may happen on a stretch of road, drawn by the region and the day. */
export interface RoadEventDef {
  readonly id: string;
  /** The kinds of road it happens on ("hill-road", "coast-road"). */
  readonly regions: readonly string[];
  readonly text: string;
  readonly options: readonly DecisionOption[];
}
