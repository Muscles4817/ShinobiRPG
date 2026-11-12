import { clamp, err, ok, type Result, type Rng } from '@/core';

import type {
  CombatChoice,
  CombatEngine,
  CombatOutcome,
  CombatState,
  CombatView,
} from '../../contract';
import type { CombatUsage } from '../../teamContract';
import { alive, hasPerk } from '../../rules/body';
import { itemsLeft } from '../../rules/items';
import { costsOwed } from '../../rules/trumps';
import { empowerCostsOwed } from '../../rules/verbs';
import { fieldMeter } from './field';
import { endOfRound } from './roundEnd';
import { CALLED_FOR, calledBack, callOwn } from './roundCalls';
import { rollIntents } from './intent';
import { upgradeLegacy, withIntents, withKits, withRows, withSlots } from './legacy';
import { openFight } from './opening';
import { withinGround } from '../../rules/ground';
import { decide, resolveExchange } from './round';
import {
  decode,
  encode,
  initialFighters,
  PLAN_ENGINE_ID,
  playerOf,
  type PlanFighter,
  type PlanState,
} from './state';
import { editTeam } from './orders';
import { summonFatesOf, summonSharesOf } from './summons';
import { metersOf, poolsLeft } from './swarmView';
import { editPlan } from './table';
import { foeMarkFor } from './foeTeam';
import { planOf, plannedFighters } from './planning';
import { squareUpLine } from '../../rules/narration';
import { fightSummary } from './summary';
import { humanHealth } from './sizing';
import { bandOf } from './distance';
import { combatantView } from './combatantView';
import { options, prompt } from './engineOptions';

export { ROUND_EXCHANGES } from './roundEnd';

/**
 * Plan & Watch, after Punch Club: before each round you slot a few cards for each distance
 * (attacks, techniques, footwork that tries to change the range, defences that react on their
 * own), then watch the round play out. Slot order is priority: each exchange you play the first
 * card that is ready and whose condition holds (see `priority.ts`). Between rounds you see what
 * worked and re-plan.
 */

/** The most rounds one "watch to the end" plays, so a fight no one can win still hands back. */
const WATCHED_ROUNDS_MAX = 20;

const FIGHT_BEGINS = '— The fight begins —';

function read(state: CombatState): PlanState {
  return withRows(withIntents(withSlots(upgradeLegacy(withKits(decode(state))))));
}

/** How each fighter on the player's side but the player ends the fight. */
function alliesAfter(fighters: readonly PlanFighter[]): Record<string, { health: number }> {
  return Object.fromEntries(
    fighters
      .filter((f) => f.side === 'player' && !f.isPlayer && f.shadowOf === undefined)
      .map((f) => [f.id, { health: Math.max(0, humanHealth(f)) }]),
  );
}

/** What each fighter used, for the outcome. */
function usage(fighters: readonly PlanFighter[]): Record<string, CombatUsage> {
  return Object.fromEntries(
    fighters.map((f) => [
      f.id,
      {
        techniqueIds: f.used ?? [],
        chakraSpent: f.chakraSpent ?? 0,
        blows: f.blows ?? 0,
        footwork: f.footwork ?? 0,
      },
    ]),
  );
}

function fleeChance(state: PlanState): number {
  const runner = playerOf(state);
  const chasers = state.fighters.filter((f) => f.side === 'enemy' && alive(f));
  const fastest = Math.max(...chasers.map((c) => c.attributes.speed));
  const band = bandOf(state, runner);
  const distance = band === 'far' ? 0.2 : band === 'mid' ? 0.1 : 0;
  return clamp(0.4 + (runner.attributes.speed - fastest) * 0.05 + distance, 0.1, 0.9);
}

/** Fights an exchange, then foes announce their next move. */
function exchange(state: PlanState, rng: Rng): PlanState {
  const next = endOfRound(resolveExchange(state, rng));
  const told = next.result ? next : { ...next, intents: rollIntents(next, rng) };
  // Something the player would want to answer stops the round (`roundCalls.ts`).
  return calledBack(state, told);
}

function watchRound(state: PlanState, rng: Rng): PlanState {
  let current = state;
  const bout = state.bout;
  while (current.phase === 'fight' && current.bout === bout && !current.result) {
    current = exchange(current, rng);
  }
  return current;
}

/** A watched fight played to its end, or for as many rounds as one press plays. */
function watchToTheEnd(state: PlanState, rng: Rng): PlanState {
  let current = state;
  while (!current.result && current.bout < state.bout + WATCHED_ROUNDS_MAX) {
    current = watchRound(current, rng);
  }
  return current;
}

function flee(state: PlanState, rng: Rng): PlanState {
  if (rng.chance(fleeChance(state))) {
    return {
      ...state,
      log: [...state.log, 'You vanish in a swirl of leaves and get clean away.'],
      result: 'escaped',
    };
  }
  const failed = {
    ...state,
    phase: 'fight' as const,
    log: [...state.log, 'You try to slip away, but they cut you off.'],
  };
  return exchange(failed, rng);
}

function act(state: PlanState, optionId: string, rng: Rng): Result<PlanState> {
  const option = options(state).find((o) => o.id === optionId);
  if (!option) return err(`Unknown combat option "${optionId}".`);
  if (option.disabledReason) return err(option.disabledReason);
  const planned = editPlan(state, optionId) ?? editTeam(state, optionId);
  if (planned) return ok(planned);
  switch (optionId) {
    case 'halt':
      return ok(callOwn(state));
    case 'begin': {
      // A round stopped by a call plays on where it stopped (`roundCalls.ts`).
      const { called: _why, ...resumed } = state;
      if (state.exchange > 0) return ok({ ...resumed, phase: 'fight' });
      // Dividers are story text too: no numbers (the round number shows above the log).
      const divider = state.bout === 1 ? FIGHT_BEGINS : '— The next round begins —';
      // Each round's slot trace starts afresh (`slotTrace.ts`).
      const { slotTrace: _last, ...fresh } = resumed;
      return ok({ ...fresh, phase: 'fight', log: [...state.log, divider] });
    }
    case 'flee':
      return ok(flee(state, rng));
    case 'round':
      return ok(watchRound(state, rng));
    case 'finish':
      return ok(watchToTheEnd(state, rng));
    default:
      return ok(exchange(state, rng));
  }
}

export function createPlanEngine(): CombatEngine {
  return {
    id: PLAN_ENGINE_ID,
    label: 'Plan & Watch',
    summary:
      'Slot cards for each distance, then watch each round play out. Re-plan between rounds.',

    start(setup, rng) {
      const opened = openFight(initialFighters(setup), setup.opening);
      const { fighters, lines, field } = opened;
      const range = withinGround(setup.ground, opened.range);
      const planned = plannedFighters(fighters, setup.plan);
      const table = {
        fighters: planned,
        ...foeMarkFor(planned),
        range,
        exchange: 0,
        round: 1,
        ...(field ? { field } : {}),
      };
      const firstMover = setup.opening?.firstMover;
      const watching = setup.watch ?? false;
      const intro = setup.intro ?? squareUpLine(setup.enemies);
      const state: PlanState = {
        phase: watching ? 'fight' : 'loadout',
        round: 1,
        bout: 1,
        exchange: 0,
        fighters: planned,
        range,
        seen: {},
        ...foeMarkFor(planned),
        intents: rollIntents(table, rng),
        log: [intro, ...lines, ...(watching ? [FIGHT_BEGINS] : [])],
        ...(setup.ground ? { ground: setup.ground } : {}),
        ...(setup.occasion ? { occasion: setup.occasion } : {}),
        result: null,
        canFlee: setup.canFlee && !watching,
        ...(watching ? { watching: true as const } : {}),
        ...(firstMover === undefined ? {} : { firstMover }),
        ...(field ? { field } : {}),
      };
      return encode(state);
    },

    act(state: CombatState, choice: CombatChoice, rng): Result<CombatState> {
      const plan = read(state);
      if (plan.result) return err('The fight is already over.');
      const next = act(plan, choice.optionId, rng);
      return next.ok ? ok(encode(next.value)) : next;
    },

    view(state): CombatView {
      const plan = read(state);
      const insight = hasPerk(playerOf(plan), 'insight');
      const meters = metersOf(fieldMeter(plan), playerOf(plan));
      return {
        round: plan.bout,
        combatants: plan.fighters.map((f) => combatantView(plan, f, insight)),
        log: plan.log,
        ...(plan.logDropped ? { logOffset: plan.logDropped } : {}),
        options: options(plan),
        range: bandOf(plan, playerOf(plan)),
        prompt: prompt(plan),
        ...(meters.length > 0 ? { meters } : {}),
        ...(plan.watching ? { watched: true as const } : {}),
        ...(plan.called && plan.phase === 'loadout' ? { called: CALLED_FOR[plan.called] } : {}),
      };
    },

    outcome(state): CombatOutcome | null {
      const plan = read(state);
      const result = plan.result ?? decide(plan.fighters);
      if (!result) return null;
      const player = playerOf(plan);
      return {
        result,
        rounds: plan.bout,
        player: { health: humanHealth(player), chakra: player.chakra },
        items: itemsLeft(player),
        plan: planOf(player),
        costs: [...costsOwed(player), ...empowerCostsOwed(player)],
        chakraSpent: player.chakraSpent ?? 0,
        used: usage(plan.fighters),
        allies: alliesAfter(plan.fighters),
        summary: fightSummary(plan, result),
        summons: summonFatesOf(player),
        summonHealth: summonSharesOf(player, plan.fighters),
        ...poolsLeft(player),
      };
    },
  };
}
