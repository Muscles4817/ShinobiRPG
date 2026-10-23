import type { CombatGround } from '@/systems/combat';
import type { StatId } from '@/systems/stats';

import type { Crew } from './crew';
import type { EncounterRun, EncounterStage } from './encounter';
import type { MissionRank, MissionRole } from './missionRank';
import type { StagePay } from './encounterPay';
import {
  startThreads,
  type Condition,
  type Effect,
  type LedgerLine,
  type ThreadDef,
} from './story';
import type {
  CampStage,
  DecisionStage,
  EndingStage,
  Outcome,
  StopStage,
  TextVariant,
} from './storyStages';

/**
 * Missions are a linear sequence of stages. This module tracks progress through them
 * and resolves stat checks. It deliberately knows nothing about *how* combat works:
 * a combat stage just names enemies, and the game layer reports back win/lose. An encounter
 * stage (`encounter.ts`) puts recon and a choice of approach before any fight.
 */

export interface CheckApproach {
  readonly label: string;
  readonly stat: StatId;
  readonly difficulty: number;
  /** On a team mission, the teammate best at the stat may take it for you. */
  readonly role?: MissionRole;
  /** Only offered when this holds. */
  readonly when?: Condition;
  /** How it went, when this way goes differently from the stage's own lines (sneaking, talking). */
  readonly success?: string;
  readonly failure?: string;
  /** What succeeding this way does besides moving on (raising trust, say). */
  readonly onSuccess?: Outcome;
  /** What failing this way does (a mark the story picks up later). */
  readonly onFailure?: Outcome;
}

type StageBody =
  | {
      readonly kind: 'narrative';
      readonly text: string;
      readonly variants?: readonly TextVariant[];
    }
  | {
      readonly kind: 'check';
      readonly text: string;
      readonly variants?: readonly TextVariant[];
      /** The player picks one approach; each tests a different stat. */
      readonly approaches: readonly CheckApproach[];
      readonly success: string;
      readonly failure: string;
      /**
       * 'penalty' docks the reward and continues; 'abort' fails the mission; 'forward' moves on
       * with no pay docked, leaving the approach's `onFailure` to change the story.
       */
      readonly onFailure: 'penalty' | 'abort' | 'forward';
      readonly failureDamage?: number;
    }
  | {
      /**
       * Days on the road with nothing worth a choice: the line sums them up, and the days pass
       * (meals from your pack, nights in camp). On a road with a `region`, something may happen
       * (a road event, drawn by the day).
       */
      readonly kind: 'leg';
      readonly text: string;
      readonly variants?: readonly TextVariant[];
      readonly days: number;
      readonly region?: string;
    }
  | {
      readonly kind: 'combat';
      readonly text: string;
      readonly enemyIds: readonly string[];
      readonly canFlee: boolean;
      /** Where the fight happens; an open arena when absent. */
      readonly ground?: CombatGround;
    }
  | EncounterStage
  | DecisionStage
  | CampStage
  | StopStage
  | EndingStage;

/** A stage, played only when its condition holds (and skipped otherwise). */
export type MissionStage = StageBody & { readonly when?: Condition };

/** Someone you look after on a job: their trust is one of its threads, moved by your tone. */
export interface ChargeDef {
  readonly name: string;
  /** The thread that is their trust in you. */
  readonly thread: string;
  /** Tones they warm to and bristle at, as a trait's tastes. */
  readonly likes: readonly string[];
  readonly dislikes: readonly string[];
}

/** A turn the story may take, rolled when the job begins: a hidden mark, by weight. */
export interface TwistDef {
  readonly mark: string;
  readonly weight: number;
}

export interface MissionDef {
  readonly id: string;
  readonly title: string;
  readonly rank: MissionRank;
  readonly client: string;
  readonly summary: string;
  /** Time slots the mission takes, charged when it begins. */
  readonly slots: number;
  readonly energyCost: number;
  readonly reward: {
    readonly ryo: number;
    readonly reputation: number;
    /** A technique scroll the client hands over on success (a technique id). */
    readonly scrollId?: string;
    /** A piece of gear the client hands over on success (a gear id), e.g. a named weapon. */
    readonly gearId?: string;
    /** A recipe the client teaches you on success (a recipe id). */
    readonly recipeId?: string;
    /** An animal that follows you home on success, if you have none (a companion kind id). */
    readonly companionKindId?: string;
    /** A summoning contract offered to you on success (a contract id); one at a time. */
    readonly contractId?: string;
    /** A hive clan's rite, found and handed over on success (a clan id). */
    readonly hiveRite?: string;
    /** An S-rank scroll that teaches command of a kind of dust (a dust id). */
    readonly dustScroll?: string;
  };
  readonly minMissionsCompleted: number;
  /** Always on the board (patrols, watches); otherwise jobs are posted for a few days at a time. */
  readonly standing?: boolean;
  /** Never posted: an exam stage runs it (the survival forest). */
  readonly examOnly?: boolean;
  /** Posted only once the village remembers this (a world mark): a follow-up to another job. */
  readonly needsWorldMark?: string;
  /** No longer posted once the village remembers this: the story it follows has moved on. */
  readonly closedBy?: string;
  /** Done once and never posted again (a follow-up that tells one moment). */
  readonly once?: true;
  /** Where the job leaves you, when it ends somewhere else (a long story's base, or home). */
  readonly endsAt?: string;
  /** Counters the story keeps (a charge's trust, the day's light). */
  readonly threads?: readonly ThreadDef[];
  /** Who you look after, if anyone. */
  readonly charge?: ChargeDef;
  /** Turns the story may take; one is rolled when the job begins (a mark of weight 0: none). */
  readonly twists?: readonly TwistDef[];
  readonly stages: readonly MissionStage[];
}

/** One line of the mission's story feed. Story text never carries numbers. */
export type MissionNote =
  | { readonly kind: 'story'; readonly text: string }
  | { readonly kind: 'choice'; readonly text: string }
  | {
      readonly kind: 'roll';
      readonly stat: StatId;
      readonly chance: number;
      readonly success: boolean;
    }
  | { readonly kind: 'outcome'; readonly text: string }
  /** Someone along says something. */
  | { readonly kind: 'voice'; readonly speaker: string; readonly text: string };

export interface MissionRun {
  readonly missionId: string;
  /** Who went with you; set when the job is taken. */
  readonly crew: Crew;
  readonly stageIndex: number;
  /** Starts at 1; each penalised check reduces it. */
  readonly rewardMultiplier: number;
  /** The story so far, shown to the player while on the mission. */
  readonly notes: readonly MissionNote[];
  /** The encounter being sized up, while the current stage is one. */
  readonly encounter?: EncounterRun;
  /** What encounters' endings did to the pay (multipliers); absent means full pay. */
  readonly pay?: { readonly ryo: number; readonly reputation: number };
  /** What has happened that the story remembers (and the twist, from the start). */
  readonly marks: readonly string[];
  /** Each thread's level, by id. */
  readonly threads: Readonly<Record<string, number>>;
  /** The job as it went, for the debrief. */
  readonly ledger: readonly LedgerLine[];
  /** At a camp: the activities done so far. */
  readonly camp?: { readonly done: readonly string[] };
  /** On a leg: the road event that came up, waiting on your choice. */
  readonly roadEvent?: string;
  /** Bond with each crew member when the job began, so the debrief can say how it grew. */
  readonly bondsAtStart?: Readonly<Record<string, number>>;
  /** What the village remembered when the job began (world marks), for `remembers`. */
  readonly remembered?: readonly string[];
  /** The village's tallies when the job began, for `tally` conditions. */
  readonly tallied?: Readonly<Record<string, number>>;
  /** What lasts beyond the job (world marks, tallies, memories), held until it is done. */
  readonly held?: readonly Effect[];
  /** Set when this is a trip of your own along the roads, not a job (`game/journeys.ts`). */
  readonly journey?: JourneyPlan;
}

/** A trip along the roads: where from and to, the way as legs, and whether to hurry. */
/**
 * A trip made while a town hunts you (`game/hunt.ts`): which town's hunters, how close they were
 * when you set out, and how close they must come this time to find you.
 */
export interface JourneyHunt {
  readonly townId: string;
  readonly heat: number;
  readonly foundAt: number;
}

export interface JourneyPlan {
  readonly from: string;
  readonly to: string;
  readonly legs: readonly {
    readonly region: string;
    readonly days: number;
    readonly text: string;
    /** The location the leg heads for (absent on trips saved before roads had a heading). */
    readonly toward?: string;
  }[];
  /** Walk on without stopping to camp; only a road event or a stop halts you. */
  readonly quick: boolean;
  /**
   * The places on the way the trip stops at, chosen when it was planned; absent on trips planned
   * before (they stop wherever a place offers it, unless hurrying).
   */
  readonly stops?: readonly string[];
  /** Set when a town hunts you along the way; absent on every other trip. */
  readonly hunt?: JourneyHunt;
}

export function startRun(def: MissionDef, crew: Crew, marks: readonly string[] = []): MissionRun {
  return {
    missionId: def.id,
    crew,
    stageIndex: 0,
    rewardMultiplier: 1,
    notes: [],
    marks,
    threads: startThreads(def.threads ?? []),
    ledger: [],
  };
}

/** The twist a job's story takes, by a roll in [0, 1); null for none. */
export function pickTwist(def: MissionDef, roll: number): string | null {
  const twists = def.twists ?? [];
  const total = twists.reduce((sum, t) => sum + t.weight, 0);
  let left = roll * total;
  for (const twist of twists) {
    left -= twist.weight;
    if (left < 0) return twist.mark;
  }
  return null;
}

/** The stage awaiting the player, or undefined when every stage is done. */
export function currentStage(def: MissionDef, run: MissionRun): MissionStage | undefined {
  return def.stages[run.stageIndex];
}

/** Moves to the next stage, adding any notes describing what just happened. */
export function advance(run: MissionRun, ...notes: MissionNote[]): MissionRun {
  // What belonged to the stage just finished (an encounter, a camp, a road event) is left behind.
  const { encounter: _encounter, camp: _camp, roadEvent: _event, ...kept } = run;
  return { ...kept, stageIndex: run.stageIndex + 1, notes: [...run.notes, ...notes] };
}

/** Days a job keeps you on the road: every leg's days. Zero for a job done within a day. */
export function daysAway(def: Pick<MissionDef, 'stages'>): number {
  return def.stages.reduce((days, s) => days + (s.kind === 'leg' ? s.days : 0), 0);
}

/**
 * The least a job should pay for each day it keeps you on the road, so a week away competes
 * with a week of training and errands at home (checked by the pacing bench).
 */
export const MIN_RYO_PER_DAY_AWAY = 120;

/** The enemies a stage may make you fight: a combat's, or the foes of an encounter. */
export function stageFoes(stage: MissionStage): readonly string[] {
  return stage.kind === 'combat' || stage.kind === 'encounter' ? stage.enemyIds : [];
}

/** Applies an encounter's pay to the run's reward. */
export function withStagePay(run: MissionRun, pay: StagePay): MissionRun {
  const ryo = (run.pay?.ryo ?? 1) * pay.ryo;
  const reputation = (run.pay?.reputation ?? 1) * pay.reputation;
  return { ...run, pay: { ryo, reputation } };
}

export function reward(def: MissionDef, run: MissionRun): { ryo: number; reputation: number } {
  return {
    ryo: Math.round(def.reward.ryo * run.rewardMultiplier * (run.pay?.ryo ?? 1)),
    reputation: Math.round(
      def.reward.reputation * run.rewardMultiplier * (run.pay?.reputation ?? 1),
    ),
  };
}
