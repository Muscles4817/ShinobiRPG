import type { Rng } from '@/core';
import { rollCheck, type StatId, type Stats } from '@/systems/stats';

import type { Crew } from './crew';
import type { EncounterRun, EncounterStage } from './encounter';
import type { MissionRank } from './missionRank';
import type { StagePay } from './encounterPay';

/**
 * Missions are a linear sequence of stages. This module tracks progress through them
 * and resolves stat checks. It deliberately knows nothing about *how* combat works:
 * a combat stage just names enemies, and the game layer reports back win/lose. An encounter
 * stage (`encounter.ts`) puts recon and a choice of approach before any fight.
 */

/**
 * Jobs on a team mission that fall to whoever on the team is best at them: the tracker follows
 * a trail, the sensor feels for chakra, the medic patches people up.
 */
export const MISSION_ROLES = ['tracker', 'sensor', 'medic'] as const;
export type MissionRole = (typeof MISSION_ROLES)[number];

export interface CheckApproach {
  readonly label: string;
  readonly stat: StatId;
  readonly difficulty: number;
  /** On a team mission, the teammate best at the stat may take it for you. */
  readonly role?: MissionRole;
}

export type MissionStage =
  | { readonly kind: 'narrative'; readonly text: string }
  | {
      readonly kind: 'check';
      readonly text: string;
      /** The player picks one approach; each tests a different stat. */
      readonly approaches: readonly CheckApproach[];
      readonly success: string;
      readonly failure: string;
      /** 'penalty' docks the reward and continues; 'abort' fails the mission. */
      readonly onFailure: 'penalty' | 'abort';
      readonly failureDamage?: number;
    }
  | {
      /**
       * Days on the road with nothing worth a choice: the line sums them up, and the days pass
       * (meals from your pack, nights in camp).
       */
      readonly kind: 'leg';
      readonly text: string;
      readonly days: number;
    }
  | {
      readonly kind: 'combat';
      readonly text: string;
      readonly enemyIds: readonly string[];
      readonly canFlee: boolean;
    }
  | EncounterStage;

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
  };
  readonly minMissionsCompleted: number;
  /** Always on the board (patrols, watches); otherwise jobs are posted for a few days at a time. */
  readonly standing?: boolean;
  /** Never posted: an exam stage runs it (the survival forest). */
  readonly examOnly?: boolean;
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
  | { readonly kind: 'outcome'; readonly text: string };

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
}

export const CHECK_FAILURE_PENALTY = 0.25;

export function startRun(def: MissionDef, crew: Crew): MissionRun {
  return { missionId: def.id, crew, stageIndex: 0, rewardMultiplier: 1, notes: [] };
}

/** The stage awaiting the player, or undefined when every stage is done. */
export function currentStage(def: MissionDef, run: MissionRun): MissionStage | undefined {
  return def.stages[run.stageIndex];
}

/** Moves to the next stage, adding any notes describing what just happened. */
export function advance(run: MissionRun, ...notes: MissionNote[]): MissionRun {
  return {
    missionId: run.missionId,
    crew: run.crew,
    stageIndex: run.stageIndex + 1,
    rewardMultiplier: run.rewardMultiplier,
    notes: [...run.notes, ...notes],
    ...(run.pay ? { pay: run.pay } : {}),
  };
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

export type CheckStage = Extract<MissionStage, { kind: 'check' }>;

/** The check being attempted and the approach the player picked for it. */
export interface CheckChoice {
  readonly stage: CheckStage;
  readonly approach: CheckApproach;
  /** A teammate who takes the check for you (a mission role), and what they roll with. */
  readonly hand?: { readonly name: string; readonly value: number };
}

export interface CheckResolution {
  readonly run: MissionRun;
  readonly aborted: boolean;
  readonly damage: number;
}

export function resolveCheck(
  run: MissionRun,
  { stage, approach, hand }: CheckChoice,
  stats: Stats,
  rng: Rng,
): CheckResolution {
  const value = hand?.value ?? stats[approach.stat];
  const { success, chance } = rollCheck(value, approach.difficulty, rng);
  const notes: MissionNote[] = [
    { kind: 'choice', text: hand ? `${approach.label} (${hand.name})` : approach.label },
    { kind: 'roll', stat: approach.stat, chance, success },
    { kind: 'story', text: success ? stage.success : stage.failure },
  ];
  if (success) return { run: advance(run, ...notes), aborted: false, damage: 0 };

  const damage = stage.failureDamage ?? 0;
  if (stage.onFailure === 'abort') {
    return { run: { ...run, notes: [...run.notes, ...notes] }, aborted: true, damage };
  }
  const rewardMultiplier = Math.max(0, run.rewardMultiplier - CHECK_FAILURE_PENALTY);
  return { run: advance({ ...run, rewardMultiplier }, ...notes), aborted: false, damage };
}

export function reward(def: MissionDef, run: MissionRun): { ryo: number; reputation: number } {
  return {
    ryo: Math.round(def.reward.ryo * run.rewardMultiplier * (run.pay?.ryo ?? 1)),
    reputation: Math.round(
      def.reward.reputation * run.rewardMultiplier * (run.pay?.reputation ?? 1),
    ),
  };
}
