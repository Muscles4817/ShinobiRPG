import {
  currentStage,
  isSeniorMission,
  reward,
  type MissionDef,
  type MissionRun,
  type MissionStage,
} from '@/systems/missions';
import { addPoints } from '@/systems/bonds';
import { recordMissionFailure, recordMissionSuccess } from '@/systems/standing';
import { earn } from '@/systems/wallet';

import type { GameContext } from './context';
import { crewDebrief, debriefLines, gradeOf, helpedOf } from './debrief';
import { forestCleared, forestLost } from './exam/forest';
import { chip, log, placeHere } from './ops';
import { handedOver } from './missionRewards';
import { tendWounds } from './missionTeam';
import { bondOf } from './people/cast';
import { addReport } from './reports';
import { settle } from './story/state';
import type { GameState } from './state';

/**
 * Orchestrates a mission's life-cycle across systems: missions (progress), wallet/standing
 * (rewards) and people (bond). Its fights are `missionFight.ts`. An exam's forest (`examOnly`)
 * ends back in the exam instead of paying or failing a job.
 */

export const FAILURE_REPUTATION_LOSS = 2;
/** Bond with each teammate for finishing a team mission together. */
export const TEAM_MISSION_BOND = 6;
export const BEATEN = 'You were beaten unconscious.';

export function activeMission(state: GameState, ctx: GameContext): MissionDef | null {
  return state.mission ? ctx.content.missions.require(state.mission.missionId) : null;
}

export function activeStage(state: GameState, ctx: GameContext): MissionStage | null {
  const def = activeMission(state, ctx);
  return def && state.mission ? (currentStage(def, state.mission) ?? null) : null;
}

/** Titles of missions here that open exactly at `completed` finished missions. */
function newlyUnlocked(state: GameState, ctx: GameContext, completed: number): string[] {
  const hall = placeHere(state, ctx, 'missions');
  return (hall?.missionIds ?? [])
    .map((id) => ctx.content.missions.require(id))
    .filter((m) => m.minMissionsCompleted === completed)
    .map((m) => m.title);
}

/**
 * After a stage is cleared: completes the mission if every stage is done; otherwise the team's
 * medic (on a team mission) patches you up for the next one.
 */
export function afterStage(before: GameState, ctx: GameContext): GameState {
  const def = activeMission(before, ctx);
  if (!def || !before.mission) return before;
  // Stages that don't apply to the story so far are passed over.
  const run = settle(def, before.mission);
  const state = { ...before, mission: run };
  if (currentStage(def, run)) return tendWounds(state, ctx);
  if (def.examOnly) return forestCleared(state, ctx);
  const earned = reward(def, state.mission);
  const senior = isSeniorMission(def.rank);
  const standing = recordMissionSuccess(state.standing, earned.reputation, senior);
  const teamBond = state.mission.crew.memberIds.length > 0 ? TEAM_MISSION_BOND : 0;
  const gifts = handedOver(state, ctx, def);
  const ending = endingLine(def, state.mission);
  const next: GameState = {
    ...withTeamBond(state, teamBond),
    mission: null,
    wallet: earn(state.wallet, earned.ryo),
    standing,
    board: state.board.completed.includes(def.id)
      ? state.board
      : { ...state.board, completed: [...state.board.completed, def.id] },
    inventory: gifts.inventory,
  };
  const logged = log(next, {
    heading: `${def.title} complete`,
    text: ending ?? `${def.client} thanks you.`,
    tone: 'success',
    chips: [
      chip(`+${earned.ryo} ryo`, 'gain'),
      chip(`+${earned.reputation} reputation`, 'gain'),
      ...(teamBond > 0 ? [chip(`+${teamBond} team bond`, 'gain')] : []),
      ...gifts.chips,
    ],
  });
  return addReport(logged, {
    kind: 'mission-complete',
    title: def.title,
    client: def.client,
    ryo: earned.ryo,
    reputation: earned.reputation,
    missionsCompleted: standing.missionsCompleted,
    unlocked: newlyUnlocked(state, ctx, standing.missionsCompleted),
    docked: Math.max(0, def.reward.ryo - earned.ryo),
    teamBond,
    ...(ending ? { ending } : {}),
    ...gifts.report,
    road: debriefLines(state.mission.ledger),
    crew: crewDebrief(next, ctx, state.mission),
    grade: gradeOf(state.mission),
  });
}

/**
 * How the job ended, when the scene closes before it can show it: the outcome of an ending
 * stage, or the last story line of a job that ends on a check.
 */
function endingLine(def: MissionDef, run: MissionRun): string | undefined {
  if (def.stages.some((s) => s.kind === 'ending')) {
    return run.notes.findLast((n) => n.kind === 'outcome')?.text;
  }
  if (def.stages.at(-1)?.kind !== 'check') return undefined;
  return run.notes.findLast((n) => n.kind === 'story')?.text;
}

/** Adds bond with everyone who went with you (not whoever led). */
function withTeamBond(state: GameState, points: number): GameState {
  const ids = state.mission?.crew.memberIds ?? [];
  if (points === 0 || ids.length === 0) return state;
  const raised = Object.fromEntries(ids.map((id) => [id, addPoints(bondOf(state, id), points)]));
  return { ...state, people: { ...state.people, bonds: { ...state.people.bonds, ...raised } } };
}

export interface Ended {
  readonly state: GameState;
  readonly title: string | null;
  /** The exam's forest ended (nothing to report as a failed job). */
  readonly exam: boolean;
}

export function endMission(
  state: GameState,
  ctx: GameContext,
  reason: string,
  reputationLost = FAILURE_REPUTATION_LOSS,
): Ended {
  const def = activeMission(state, ctx);
  if (def?.examOnly) {
    const exit = reason === BEATEN ? 'beaten' : 'no-token';
    return { state: forestLost(state, ctx, exit), title: null, exam: true };
  }
  const next: GameState = {
    ...state,
    mission: null,
    combat: null,
    standing: recordMissionFailure(state.standing, reputationLost),
  };
  const logged = log(next, {
    heading: def ? `${def.title} failed` : 'Mission failed',
    text: reason,
    tone: 'danger',
    chips: reputationLost > 0 ? [chip(`−${reputationLost} reputation`, 'harm')] : [],
  });
  return { state: logged, title: def?.title ?? null, exam: false };
}

/** Ends the mission as failed; `reputationLost` is less for pulling out before any harm. */
export function failMission(
  state: GameState,
  ctx: GameContext,
  reason: string,
  reputationLost = FAILURE_REPUTATION_LOSS,
): GameState {
  const def = activeMission(state, ctx);
  const helped = def ? helpedOf(state, ctx, def) : null;
  const road = debriefLines(state.mission?.ledger ?? []);
  const ended = endMission(state, ctx, reason, reputationLost);
  if (ended.exam) return ended.state;
  return addReport(ended.state, {
    kind: 'mission-failed',
    title: ended.title ?? 'Mission',
    reason,
    reputationLost,
    road,
    ...(helped ? { helped } : {}),
  });
}
