import type { Rng } from '@/core';
import type { CombatOutcome } from '@/systems/combat';
import {
  advance,
  currentStage,
  reward,
  type MissionDef,
  type MissionStage,
} from '@/systems/missions';
import { recordMissionFailure, recordMissionSuccess } from '@/systems/standing';
import { slotsUntilNextMorning } from '@/systems/time';
import { maxHealth } from '@/systems/vitals';
import { deduct, earn } from '@/systems/wallet';

import { enemyCombatant, playerCombatant } from './combatants';
import type { GameContext } from './context';
import { adjust, log, spendTime } from './ops';
import type { GameState } from './state';

/**
 * Orchestrates a mission's life-cycle across systems: missions (progress), combat
 * (fights, via the engine contract), wallet/standing (rewards) and vitals (injuries).
 */

export const FAILURE_REPUTATION_LOSS = 2;
export const HOSPITAL_FEE = 40;
const HOSPITAL_HEALTH_FRACTION = 0.25;

export function activeMission(state: GameState, ctx: GameContext): MissionDef | null {
  return state.mission ? ctx.content.missions.require(state.mission.missionId) : null;
}

export function activeStage(state: GameState, ctx: GameContext): MissionStage | null {
  const def = activeMission(state, ctx);
  return def && state.mission ? (currentStage(def, state.mission) ?? null) : null;
}

/** Completes the mission if every stage is done; otherwise returns the state unchanged. */
export function completeIfFinished(state: GameState, ctx: GameContext): GameState {
  const def = activeMission(state, ctx);
  if (!def || !state.mission || currentStage(def, state.mission)) return state;
  const earned = reward(def, state.mission);
  const next: GameState = {
    ...state,
    mission: null,
    wallet: earn(state.wallet, earned.ryo),
    standing: recordMissionSuccess(state.standing, earned.reputation),
  };
  return log(
    next,
    `Mission complete: ${def.title}. Earned ${earned.ryo} ryo and ${earned.reputation} reputation.`,
    'success',
  );
}

export function failMission(state: GameState, ctx: GameContext, reason: string): GameState {
  const def = activeMission(state, ctx);
  const next: GameState = {
    ...state,
    mission: null,
    combat: null,
    standing: recordMissionFailure(state.standing, FAILURE_REPUTATION_LOSS),
  };
  return log(next, `Mission failed${def ? `: ${def.title}` : ''}. ${reason}`, 'danger');
}

export function beginCombat(state: GameState, ctx: GameContext, rng: Rng): GameState {
  const stage = activeStage(state, ctx);
  if (stage?.kind !== 'combat') return state;
  const enemies = stage.enemyIds.map((id, i) =>
    enemyCombatant(ctx.content.enemies.require(id), i, ctx),
  );
  const combat = ctx.combat.start(
    { player: playerCombatant(state, ctx), enemies, canFlee: stage.canFlee },
    rng,
  );
  return { ...state, combat };
}

function hospitalise(state: GameState): GameState {
  const fee = Math.min(state.wallet.ryo, HOSPITAL_FEE);
  const recovered = spendTime(state, slotsUntilNextMorning(state.time));
  const health = Math.round(maxHealth(state.character.stats) * HOSPITAL_HEALTH_FRACTION);
  const patched = adjust(recovered, { health: health - recovered.character.vitals.health });
  return log(
    { ...patched, wallet: deduct(patched.wallet, fee) },
    `You wake in the village hospital the next morning. The bill is ${fee} ryo.`,
    'warning',
  );
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

  switch (outcome.result) {
    case 'victory': {
      if (!afterFight.mission) return log(afterFight, 'You won the fight.', 'success');
      const mission = advance(afterFight.mission, `You won the fight in ${outcome.rounds} rounds.`);
      return completeIfFinished({ ...afterFight, mission }, ctx);
    }
    case 'escaped':
      return failMission(afterFight, ctx, 'You retreated from the fight.');
    case 'defeat':
      return hospitalise(failMission(afterFight, ctx, 'You were beaten unconscious.'));
  }
}
