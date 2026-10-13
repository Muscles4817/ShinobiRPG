import type { Rng } from '@/core';
import { rollCheck, type Stats } from '@/systems/stats';

import {
  advance,
  type CheckApproach,
  type MissionNote,
  type MissionRun,
  type MissionStage,
} from './missions';
import { addLedger, applyOutcome, type StoryDef } from './outcomes';
import type { Effect } from './story';

/**
 * Resolving a check: the roll, the story's notes, and what failing does (dock the pay, end the
 * job, or move the story on), with each approach's own outcome applied.
 */

export const CHECK_FAILURE_PENALTY = 0.25;

export type CheckStage = Extract<MissionStage, { kind: 'check' }>;

/** The check being attempted and the approach the player picked for it. */
export interface CheckChoice {
  readonly stage: CheckStage;
  readonly approach: CheckApproach;
  /** A teammate who takes the check for you (a mission role), and what they roll with. */
  readonly hand?: { readonly name: string; readonly value: number };
  /** The job's threads and charge, which an approach's outcome may move. */
  readonly story: StoryDef;
}

export interface CheckResolution {
  readonly run: MissionRun;
  readonly aborted: boolean;
  readonly damage: number;
  /** What the outcome does to you or the crew (bond, harm, energy), for the game layer. */
  readonly personal: readonly Effect[];
}

export function resolveCheck(
  run: MissionRun,
  { stage, approach, hand, story }: CheckChoice,
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
  if (success) {
    const won = applyOutcome(run, story, approach.onSuccess, 'gain');
    return { run: advance(won.run, ...notes), aborted: false, damage: 0, personal: won.personal };
  }
  // A docked check writes its own ledger line (below), so the outcome's line isn't written twice.
  const penalty = stage.onFailure === 'penalty';
  const failed = penalty ? { effects: approach.onFailure?.effects ?? [] } : approach.onFailure;
  const lost = applyOutcome(run, story, failed, 'cost');
  const damage = stage.failureDamage ?? 0;
  if (stage.onFailure === 'abort') {
    const ended = { ...lost.run, notes: [...lost.run.notes, ...notes] };
    return { run: ended, aborted: true, damage, personal: lost.personal };
  }
  if (stage.onFailure === 'forward') {
    return { run: advance(lost.run, ...notes), aborted: false, damage, personal: lost.personal };
  }
  const docked = addLedger(
    {
      ...lost.run,
      rewardMultiplier: Math.max(0, lost.run.rewardMultiplier - CHECK_FAILURE_PENALTY),
    },
    {
      text: approach.onFailure?.ledger ?? stage.failure,
      tone: 'cost',
      pay: -CHECK_FAILURE_PENALTY,
    },
  );
  return { run: advance(docked, ...notes), aborted: false, damage, personal: lost.personal };
}
