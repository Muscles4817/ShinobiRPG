import type { Rng } from '@/core';
import type { CombatOpening, CombatOutcome } from '@/systems/combat';
import {
  advance,
  currentStage,
  isSeniorMission,
  reward,
  stageFoes,
  stagePay,
  withStagePay,
  type MissionDef,
  type MissionRun,
  type MissionStage,
} from '@/systems/missions';
import { addPoints } from '@/systems/bonds';
import { recordMissionFailure, recordMissionSuccess } from '@/systems/standing';
import { slotsUntilNextMorning } from '@/systems/time';
import { MAX_HEALTH } from '@/systems/vitals';
import { deduct, earn } from '@/systems/wallet';

import { enemyCombatant, playerCombatant } from './combatants';
import type { GameContext } from './context';
import { forestCleared, forestLost } from './exam/forest';
import { startFight } from './fightStyle';
import { adjust, chip, log, placeHere, spendTime } from './ops';
import { handedOver } from './missionRewards';
import { teamAllies, tendWounds } from './missionTeam';
import { bondOf } from './people/cast';
import { addReport } from './reports';
import type { GameState } from './state';

/**
 * Orchestrates a mission's life-cycle across systems: missions (progress), combat
 * (fights, via the engine contract), wallet/standing (rewards) and vitals (injuries). An
 * exam's forest (`examOnly`) ends back in the exam instead of paying or failing a job.
 */

export const FAILURE_REPUTATION_LOSS = 2;
export const HOSPITAL_FEE = 40;
/** Bond with each teammate for finishing a team mission together. */
export const TEAM_MISSION_BOND = 6;
const HOSPITAL_HEALTH_FRACTION = 0.25;
const BEATEN = 'You were beaten unconscious.';

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
export function afterStage(state: GameState, ctx: GameContext): GameState {
  const def = activeMission(state, ctx);
  if (!def || !state.mission) return state;
  if (currentStage(def, state.mission)) return tendWounds(state, ctx, def);
  if (def.examOnly) return forestCleared(state, ctx);
  const earned = reward(def, state.mission);
  const senior = isSeniorMission(def.rank);
  const standing = recordMissionSuccess(state.standing, earned.reputation, senior);
  const teamBond = def.withTeam ? TEAM_MISSION_BOND : 0;
  const gifts = handedOver(state, ctx, def);
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
    text: `${def.client} thanks you.`,
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
    ...gifts.report,
  });
}

/** Adds bond with every teammate. */
function withTeamBond(state: GameState, points: number): GameState {
  const ids = state.people.team?.teammateIds ?? [];
  if (points === 0 || ids.length === 0) return state;
  const raised = Object.fromEntries(ids.map((id) => [id, addPoints(bondOf(state, id), points)]));
  return { ...state, people: { ...state.people, bonds: { ...state.people.bonds, ...raised } } };
}

interface Ended {
  readonly state: GameState;
  readonly title: string | null;
  /** The exam's forest ended (nothing to report as a failed job). */
  readonly exam: boolean;
}

function endMission(
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
  const ended = endMission(state, ctx, reason, reputationLost);
  if (ended.exam) return ended.state;
  return addReport(ended.state, {
    kind: 'mission-failed',
    title: ended.title ?? 'Mission',
    reason,
    reputationLost,
  });
}

/** How a mission fight begins, when an encounter's approach shaped it. */
export interface FightStart {
  readonly opening?: CombatOpening;
  readonly intro?: string;
}

/** Starts the fight of the current combat or encounter stage. */
export function beginCombat(
  state: GameState,
  ctx: GameContext,
  rng: Rng,
  start: FightStart = {},
): GameState {
  const stage = activeStage(state, ctx);
  if (stage?.kind !== 'combat' && stage?.kind !== 'encounter') return state;
  const enemies = stage.enemyIds.map((id, i) =>
    enemyCombatant(ctx.content.enemies.require(id), i, ctx),
  );
  const combat = startFight(
    state,
    ctx,
    {
      player: playerCombatant(state, ctx),
      allies: teamAllies(state, ctx, activeMission(state, ctx)),
      enemies,
      canFlee: stage.canFlee,
      ...(start.opening ? { opening: start.opening } : {}),
      ...(start.intro ? { intro: start.intro } : {}),
    },
    rng,
  );
  return { ...state, combat };
}

/** A won fight moves the mission on; an encounter's fight pays as its job says. */
function afterVictory(run: MissionRun, stage: MissionStage | null, enemies: string): MissionRun {
  const next = advance(run, { kind: 'outcome', text: `You defeated ${enemies}.` });
  return stage?.kind === 'encounter' ? withStagePay(next, stagePay(stage.job, 'fought')) : next;
}

function hospitalise(state: GameState, ctx: GameContext, title: string | null): GameState {
  const fee = Math.min(state.wallet.ryo, HOSPITAL_FEE);
  const recovered = spendTime(state, slotsUntilNextMorning(state.time), ctx);
  const health = Math.round(MAX_HEALTH * HOSPITAL_HEALTH_FRACTION);
  const patched = adjust(recovered, { health: health - recovered.character.vitals.health });
  const text = ctx.content.text.hospitalWake;
  const logged = log(
    { ...patched, wallet: deduct(patched.wallet, fee) },
    {
      text,
      tone: 'warning',
      chips: [chip(`−${fee} ryo`, 'cost')],
    },
  );
  return addReport(logged, {
    kind: 'defeat',
    title,
    hospitalFee: fee,
    reputationLost: title ? FAILURE_REPUTATION_LOSS : 0,
    text,
  });
}

/** Applies a finished fight's outcome to the character and the mission it belonged to. */
export function resolveCombat(
  state: GameState,
  outcome: CombatOutcome,
  ctx: GameContext,
): GameState {
  const { vitals } = state.character;
  const afterFight = adjust(
    { ...state, combat: null },
    {
      health: outcome.player.health - vitals.health,
      chakra: outcome.player.chakra - vitals.chakra,
    },
  );
  const stage = activeStage(state, ctx);
  const foes = stage ? stageFoes(stage) : [];
  const enemies =
    foes.length > 0
      ? foes.map((id) => ctx.content.enemies.require(id).name).join(' and ')
      : 'your opponent';

  switch (outcome.result) {
    case 'victory': {
      const reported = addReport(afterFight, {
        kind: 'fight',
        result: 'victory',
        enemies,
        rounds: outcome.rounds,
        damageTaken: Math.max(0, vitals.health - outcome.player.health),
        chakraSpent: Math.max(0, vitals.chakra - outcome.player.chakra),
        health: afterFight.character.vitals.health,
        maxHealth: MAX_HEALTH,
      });
      if (!reported.mission) return reported;
      const mission = afterVictory(reported.mission, stage, enemies);
      return afterStage({ ...reported, mission }, ctx);
    }
    case 'escaped':
      return failMission(afterFight, ctx, 'You retreated from the fight.');
    case 'defeat': {
      const ended = endMission(afterFight, ctx, BEATEN);
      return hospitalise(ended.state, ctx, ended.title);
    }
  }
}
