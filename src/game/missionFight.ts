import type { Rng } from '@/core';
import type { CombatOpening, CombatOutcome } from '@/systems/combat';
import {
  addLedger,
  advance,
  END_MARKS,
  stageFoes,
  stagePay,
  withMark,
  withStagePay,
  type MissionRun,
  type MissionStage,
} from '@/systems/missions';
import { slotsUntilNextMorning } from '@/systems/time';
import { MAX_HEALTH } from '@/systems/vitals';
import { deduct } from '@/systems/wallet';

import { enemyCombatant, playerCombatant } from './combatants';
import type { GameContext } from './context';
import { startFight } from './fightStyle';
import { helpedOf } from './debrief';
import {
  activeMission,
  activeStage,
  afterStage,
  BEATEN,
  endMission,
  failMission,
  FAILURE_REPUTATION_LOSS,
} from './missionFlow';
import { teamAllies } from './missionTeam';
import { adjust, chip, log, spendTime } from './ops';
import { addReport } from './reports';
import { takeSpoils } from './spoils';
import type { GameState } from './state';

/**
 * A mission's fights: starting one with the crew beside you and the opening an approach
 * earned, and what its end does to the job (moving on, a retreat, or the hospital).
 */

export const HOSPITAL_FEE = 40;
const HOSPITAL_HEALTH_FRACTION = 0.25;
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
      allies: teamAllies(state, ctx),
      enemies,
      canFlee: stage.canFlee,
      ...(stage.ground ? { ground: stage.ground } : {}),
      ...(start.opening ? { opening: start.opening } : {}),
      ...(start.intro ? { intro: start.intro } : {}),
    },
    rng,
  );
  return { ...state, combat };
}

/** A won fight moves the mission on; an encounter's fight pays as its job says. */
function afterVictory(run: MissionRun, stage: MissionStage | null, enemies: string): MissionRun {
  const fought = { ...run, marks: withMark(run.marks, END_MARKS.fought) };
  const won = addLedger(fought, { text: `Beat ${enemies} in a fight.`, tone: 'plain' });
  const next = advance(won, { kind: 'outcome', text: `You defeated ${enemies}.` });
  return stage?.kind === 'encounter' ? withStagePay(next, stagePay(stage.job, 'fought')) : next;
}

/** What a sensei says of a beating when nothing more particular would have helped. */
const READ_THEM_FIRST = 'Next time, find out what you face before you fight it.';

interface Beaten {
  readonly title: string | null;
  readonly helped: string | null;
}

function hospitalise(state: GameState, ctx: GameContext, beaten: Beaten): GameState {
  const { title, helped } = beaten;
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
    ...(helped ? { helped } : {}),
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
      const reported = addReport(takeSpoils(afterFight, ctx, foes), {
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
      const def = activeMission(afterFight, ctx);
      const helped = def ? helpedOf(afterFight, ctx, def) : null;
      const ended = endMission(afterFight, ctx, BEATEN);
      // Your sensei hears about it, and brings it up at the next lesson.
      const mentor = { ...ended.state.mentor, lastBeaten: helped ?? READ_THEM_FIRST };
      return hospitalise({ ...ended.state, mentor }, ctx, { title: ended.title, helped });
    }
  }
}
