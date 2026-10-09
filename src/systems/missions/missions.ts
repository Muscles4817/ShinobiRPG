import type { Rng } from '@/core';
import { rollCheck, type StatId, type Stats } from '@/systems/stats';

/**
 * Missions are a linear sequence of stages. This module tracks progress through them
 * and resolves stat checks. It deliberately knows nothing about *how* combat works:
 * a combat stage just names enemies, and the game layer reports back win/lose.
 */
export type MissionRank = 'D' | 'C' | 'B' | 'A' | 'S';

export interface CheckApproach {
  readonly label: string;
  readonly stat: StatId;
  readonly difficulty: number;
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
      readonly kind: 'combat';
      readonly text: string;
      readonly enemyIds: readonly string[];
      readonly canFlee: boolean;
    };

export interface MissionDef {
  readonly id: string;
  readonly title: string;
  readonly rank: MissionRank;
  readonly client: string;
  readonly summary: string;
  /** Time slots the mission takes, charged when it begins. */
  readonly slots: number;
  readonly energyCost: number;
  readonly reward: { readonly ryo: number; readonly reputation: number };
  readonly minMissionsCompleted: number;
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
  readonly stageIndex: number;
  /** Starts at 1; each penalised check reduces it. */
  readonly rewardMultiplier: number;
  /** The story so far, shown to the player while on the mission. */
  readonly notes: readonly MissionNote[];
}

export const CHECK_FAILURE_PENALTY = 0.25;

export function startRun(def: MissionDef): MissionRun {
  return { missionId: def.id, stageIndex: 0, rewardMultiplier: 1, notes: [] };
}

/** The stage awaiting the player, or undefined when every stage is done. */
export function currentStage(def: MissionDef, run: MissionRun): MissionStage | undefined {
  return def.stages[run.stageIndex];
}

/** Moves to the next stage, adding any notes describing what just happened. */
export function advance(run: MissionRun, ...notes: MissionNote[]): MissionRun {
  return { ...run, stageIndex: run.stageIndex + 1, notes: [...run.notes, ...notes] };
}

export type CheckStage = Extract<MissionStage, { kind: 'check' }>;

/** The check being attempted and the approach the player picked for it. */
export interface CheckChoice {
  readonly stage: CheckStage;
  readonly approach: CheckApproach;
}

export interface CheckResolution {
  readonly run: MissionRun;
  readonly aborted: boolean;
  readonly damage: number;
}

export function resolveCheck(
  run: MissionRun,
  { stage, approach }: CheckChoice,
  stats: Stats,
  rng: Rng,
): CheckResolution {
  const { success, chance } = rollCheck(stats[approach.stat], approach.difficulty, rng);
  const notes: MissionNote[] = [
    { kind: 'choice', text: approach.label },
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
    ryo: Math.round(def.reward.ryo * run.rewardMultiplier),
    reputation: Math.round(def.reward.reputation * run.rewardMultiplier),
  };
}
