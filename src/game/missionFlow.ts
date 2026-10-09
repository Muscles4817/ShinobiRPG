import type { Rng } from '@/core';
import type { CombatOutcome } from '@/systems/combat';
import {
  advance,
  currentStage,
  reward,
  type MissionDef,
  type MissionStage,
} from '@/systems/missions';
import { addPoints } from '@/systems/bonds';
import { recordMissionFailure, recordMissionSuccess } from '@/systems/standing';
import { slotsUntilNextMorning } from '@/systems/time';
import { maxHealth } from '@/systems/vitals';
import { deduct, earn } from '@/systems/wallet';

import { enemyCombatant, playerCombatant } from './combatants';
import type { GameContext } from './context';
import { adjust, chip, log, placeHere, spendTime } from './ops';
import { bondOf, requirePerson } from './people/cast';
import { companionCombatant } from './people/companions';
import { addReport } from './reports';
import type { GameState } from './state';

/**
 * Orchestrates a mission's life-cycle across systems: missions (progress), combat
 * (fights, via the engine contract), wallet/standing (rewards) and vitals (injuries).
 */

export const FAILURE_REPUTATION_LOSS = 2;
export const HOSPITAL_FEE = 40;
/** Bond with each teammate for finishing a team mission together. */
export const TEAM_MISSION_BOND = 6;
const TEAMMATE_TAG = 'Teammate';
const HOSPITAL_HEALTH_FRACTION = 0.25;

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

/** Completes the mission if every stage is done; otherwise returns the state unchanged. */
export function completeIfFinished(state: GameState, ctx: GameContext): GameState {
  const def = activeMission(state, ctx);
  if (!def || !state.mission || currentStage(def, state.mission)) return state;
  const earned = reward(def, state.mission);
  const standing = recordMissionSuccess(state.standing, earned.reputation);
  const teamBond = def.withTeam ? TEAM_MISSION_BOND : 0;
  const next: GameState = {
    ...withTeamBond(state, teamBond),
    mission: null,
    wallet: earn(state.wallet, earned.ryo),
    standing,
  };
  const logged = log(next, {
    heading: `${def.title} complete`,
    text: `${def.client} thanks you.`,
    tone: 'success',
    chips: [
      chip(`+${earned.ryo} ryo`, 'gain'),
      chip(`+${earned.reputation} reputation`, 'gain'),
      ...(teamBond > 0 ? [chip(`+${teamBond} team bond`, 'gain')] : []),
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
    teamBond,
  });
}

/** Adds bond with every teammate. */
function withTeamBond(state: GameState, points: number): GameState {
  const ids = state.people.team?.teammateIds ?? [];
  if (points === 0 || ids.length === 0) return state;
  const raised = Object.fromEntries(ids.map((id) => [id, addPoints(bondOf(state, id), points)]));
  return { ...state, people: { ...state.people, bonds: { ...state.people.bonds, ...raised } } };
}

/** Teammates who fight beside you on team missions. */
function teamAllies(state: GameState, ctx: GameContext) {
  const def = activeMission(state, ctx);
  if (!def?.withTeam) return [];
  return (state.people.team?.teammateIds ?? []).map((id) =>
    companionCombatant(requirePerson(state, ctx, id), state, ctx, TEAMMATE_TAG),
  );
}

function endMission(
  state: GameState,
  ctx: GameContext,
  reason: string,
): { state: GameState; title: string | null } {
  const def = activeMission(state, ctx);
  const next: GameState = {
    ...state,
    mission: null,
    combat: null,
    standing: recordMissionFailure(state.standing, FAILURE_REPUTATION_LOSS),
  };
  const logged = log(next, {
    heading: def ? `${def.title} failed` : 'Mission failed',
    text: reason,
    tone: 'danger',
    chips: [chip(`−${FAILURE_REPUTATION_LOSS} reputation`, 'harm')],
  });
  return { state: logged, title: def?.title ?? null };
}

export function failMission(state: GameState, ctx: GameContext, reason: string): GameState {
  const ended = endMission(state, ctx, reason);
  return addReport(ended.state, {
    kind: 'mission-failed',
    title: ended.title ?? 'Mission',
    reason,
    reputationLost: FAILURE_REPUTATION_LOSS,
  });
}

export function beginCombat(state: GameState, ctx: GameContext, rng: Rng): GameState {
  const stage = activeStage(state, ctx);
  if (stage?.kind !== 'combat') return state;
  const enemies = stage.enemyIds.map((id, i) =>
    enemyCombatant(ctx.content.enemies.require(id), i, ctx),
  );
  const combat = ctx.combat.start(
    {
      player: playerCombatant(state, ctx),
      allies: teamAllies(state, ctx),
      enemies,
      canFlee: stage.canFlee,
    },
    rng,
  );
  return { ...state, combat };
}

function hospitalise(state: GameState, ctx: GameContext, title: string | null): GameState {
  const fee = Math.min(state.wallet.ryo, HOSPITAL_FEE);
  const recovered = spendTime(state, slotsUntilNextMorning(state.time), ctx);
  const health = Math.round(maxHealth(state.character.stats) * HOSPITAL_HEALTH_FRACTION);
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
  const { vitals, stats } = state.character;
  const afterFight = adjust(
    { ...state, combat: null },
    {
      health: outcome.player.health - vitals.health,
      chakra: outcome.player.chakra - vitals.chakra,
    },
  );
  const stage = activeStage(state, ctx);
  const enemies =
    stage?.kind === 'combat'
      ? stage.enemyIds.map((id) => ctx.content.enemies.require(id).name).join(' and ')
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
        maxHealth: maxHealth(stats),
      });
      if (!reported.mission) return reported;
      const mission = advance(reported.mission, {
        kind: 'outcome',
        text: `You defeated ${enemies}.`,
      });
      return completeIfFinished({ ...reported, mission }, ctx);
    }
    case 'escaped':
      return failMission(afterFight, ctx, 'You retreated from the fight.');
    case 'defeat': {
      const ended = endMission(afterFight, ctx, 'You were beaten unconscious.');
      return hospitalise(ended.state, ctx, ended.title);
    }
  }
}
